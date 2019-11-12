"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const instagram_private_api_1 = require("instagram-private-api");
const lodash_1 = require("lodash");
const inquirer = require('inquirer');
// import { LocalStorage } from 'node-localstorage';
// const storage = new LocalStorage('./instagram_data');
const ig = new instagram_private_api_1.IgApiClient();
// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice(process.env.IG_USERNAME);
// Optionally you can setup proxy url
// ig.state.proxyUrl = process.env.IG_PROXY;
exports.init = (() => __awaiter(void 0, void 0, void 0, function* () {
    // Execute all requests prior to authorization in the real Android application
    // Not required but recommended
    yield ig.simulate.preLoginFlow();
    let loggedInUser = null;
    try {
        loggedInUser = yield ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    }
    catch (err) {
        if (err instanceof instagram_private_api_1.IgCheckpointError) {
            console.log(ig.state.checkpoint); // Checkpoint info here
            yield ig.challenge.auto(true);
            // Requesting sms-code or click "It was me" button
            // console.log(ig.state.checkpoint); // Challenge info here
            const { code } = yield inquirer.prompt([
                {
                    type: 'input',
                    name: 'code',
                    message: 'Enter code',
                },
            ]);
            // ig.challenge.replay('0');
            // console.log(await ig.challenge.sendSecurityCode(code));
            // console.log(err);
            // ig.account.twoFactorLogin()
            loggedInUser = yield ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        }
        else {
            console.error('Unknown error', err);
            return;
        }
    }
    // The same as preLoginFlow()
    // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () { return yield ig.simulate.postLoginFlow(); }));
    // Create UserFeed instance to get loggedInUser's posts
    const userFeed = ig.feed.user(loggedInUser.pk);
    const myPostsFirstPage = yield userFeed.items();
    // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page
    const myPostsSecondPage = yield userFeed.items();
    yield ig.media.like({
        // Like our first post from first page or first post from second page randomly
        mediaId: lodash_1.sample([myPostsFirstPage[0].id, myPostsSecondPage[0].id]),
        moduleInfo: {
            module_name: 'profile',
            user_id: loggedInUser.pk,
            username: loggedInUser.username,
        },
        d: lodash_1.sample([0, 1]),
    });
}));
//# sourceMappingURL=App.js.map