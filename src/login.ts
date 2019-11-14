import {
  IgApiClient,
  IgCheckpointError,
  IgLoginTwoFactorRequiredError,
  // DirectThreadEntity,
} from 'instagram-private-api';

import { LocalStorage } from 'node-localstorage';
const storage = new LocalStorage('./instagram_data');
const inquirer = require('inquirer');

// TODO when event system is implemented, save session on exit
export const saveSession = async (client: IgApiClient) => {
	const cookie = await client.state.serializeCookieJar();

  // console.log('cookie', cookie);

  storage.setItem('session_cookie', JSON.stringify(cookie));
}

export const restoreSession = async (client: IgApiClient) => {
  const cookie = await storage.getItem('session_cookie');

  await client.state.deserializeCookieJar(cookie);

  try {
		// check if session is still valid
		const tl = client.feed.timeline('warm_start_fetch');
		await tl.items();
	} catch {
    throw new Error('Session expired, needs relogin')
	}

  return cookie
}

export const login = async (ig) => {
  // if (restoreSession(ig)) {
  //   return ig.account.currentUser;
  // }

  ig.state.generateDevice(process.env.IG_USERNAME);
  ig.state.proxyUrl = process.env.IG_PROXY;

  await ig.simulate.preLoginFlow();

  let loggedInUser = null;

  try {
    loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  } catch (err) {
    if (err instanceof IgCheckpointError) {
      console.log(ig.state.checkpoint); // Checkpoint info here

      await ig.challenge.auto(true);

      const { code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'code',
          message: 'Enter code',
        },
      ]);

      const res = await ig.challenge.sendSecurityCode(code);

      console.log('res', res);

      if (!res.logged_in_user) {
        console.error('No user logged in', res);
        return
      }

      loggedInUser = res.logged_in_user;
    } else if (err instanceof IgLoginTwoFactorRequiredError) {
      console.error('Two-factor auth not supported yet', err);
      // but can use this code: https://github.com/breuerfelix/jinsta/blob/031fcd085c459c9d9d1b2c03946413b13eef9c22/src/session.ts#L127-L135
      return
    } else {
      console.error('Unknown error', err);
      return
    }
  }

  process.nextTick(async () => await ig.simulate.postLoginFlow());

  await saveSession(ig);

  return loggedInUser;
}
