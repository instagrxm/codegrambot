var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
require('dotenv').config();
var _a = require('instagram-private-api'), IgApiClient = _a.IgApiClient, IgCheckpointError = _a.IgCheckpointError;
var sample = require('lodash').sample;
var inquirer = require('inquirer');
var ig = new IgApiClient();
// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice(process.env.IG_USERNAME);
// Optionally you can setup proxy url
// ig.state.proxyUrl = process.env.IG_PROXY;
(function () { return __awaiter(_this, void 0, void 0, function () {
    var loggedInUser, err_1, code, userFeed, myPostsFirstPage, myPostsSecondPage;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Execute all requests prior to authorization in the real Android application
            // Not required but recommended
            return [4 /*yield*/, ig.simulate.preLoginFlow()];
            case 1:
                // Execute all requests prior to authorization in the real Android application
                // Not required but recommended
                _a.sent();
                loggedInUser = null;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 10]);
                return [4 /*yield*/, ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)];
            case 3:
                loggedInUser = _a.sent();
                return [3 /*break*/, 10];
            case 4:
                err_1 = _a.sent();
                if (!(err_1 instanceof IgCheckpointError)) return [3 /*break*/, 8];
                console.log(ig.state.checkpoint); // Checkpoint info here
                return [4 /*yield*/, ig.challenge.auto(true)];
            case 5:
                _a.sent();
                return [4 /*yield*/, inquirer.prompt([
                        {
                            type: 'input',
                            name: 'code',
                            message: 'Enter code'
                        },
                    ])];
            case 6:
                code = (_a.sent()).code;
                return [4 /*yield*/, ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)];
            case 7:
                loggedInUser = _a.sent();
                return [3 /*break*/, 9];
            case 8:
                console.error('Unknown error');
                return [2 /*return*/];
            case 9: return [3 /*break*/, 10];
            case 10:
                // The same as preLoginFlow()
                // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
                process.nextTick(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, ig.simulate.postLoginFlow()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); });
                userFeed = ig.feed.user(loggedInUser.pk);
                return [4 /*yield*/, userFeed.items()];
            case 11:
                myPostsFirstPage = _a.sent();
                return [4 /*yield*/, userFeed.items()];
            case 12:
                myPostsSecondPage = _a.sent();
                return [4 /*yield*/, ig.media.like({
                        // Like our first post from first page or first post from second page randomly
                        mediaId: sample([myPostsFirstPage[0].id, myPostsSecondPage[0].id]),
                        moduleInfo: {
                            module_name: 'profile',
                            user_id: loggedInUser.pk,
                            username: loggedInUser.username
                        },
                        d: sample([0, 1])
                    })];
            case 13:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
