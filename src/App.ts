import { IgApiClient, IgCheckpointError } from 'instagram-private-api';
import { sample } from 'lodash';
const inquirer = require('inquirer');
// import { LocalStorage } from 'node-localstorage';
// const storage = new LocalStorage('./instagram_data');

const ig = new IgApiClient();

// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice(process.env.IG_USERNAME);

// Optionally you can setup proxy url
// ig.state.proxyUrl = process.env.IG_PROXY;

export const init = (async () => {
  // Execute all requests prior to authorization in the real Android application
  // Not required but recommended
  await ig.simulate.preLoginFlow();

  let loggedInUser = null;
  try {
    loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  } catch (err) {
    if (err instanceof IgCheckpointError) {
      console.log(ig.state.checkpoint); // Checkpoint info here
      await ig.challenge.auto(true);
      // Requesting sms-code or click "It was me" button

      console.log(ig.state.checkpoint); // Challenge info here
      const { code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'code',
          message: 'Enter code',
        },
      ]);

      loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    } else {
      console.error('Unknown error', err);
      return
    }
  }

  // The same as preLoginFlow()
  // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
  process.nextTick(async () => await ig.simulate.postLoginFlow());
  // Create UserFeed instance to get loggedInUser's posts
  const userFeed = ig.feed.user(loggedInUser.pk);
  const myPostsFirstPage = await userFeed.items();
  // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page
  const myPostsSecondPage = await userFeed.items();
  await ig.media.like({
    // Like our first post from first page or first post from second page randomly
    mediaId: sample([myPostsFirstPage[0].id, myPostsSecondPage[0].id]),
    moduleInfo: {
      module_name: 'profile',
      user_id: loggedInUser.pk,
      username: loggedInUser.username,
    },
    d: sample([0, 1]),
  });
});
