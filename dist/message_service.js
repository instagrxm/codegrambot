// const instagram = {}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let message_state = {};
const updateThreadState = () => {
};
const updateState = () => __awaiter(this, void 0, void 0, function* () {
    let old_state = message_state;
    let new_state = {};
    let new_messages = {};
    const { inbox: { threads } } = yield instagram.callMethod('get_inbox');
    threads.forEach(thread => {
        const thread_id = thread.thread_id;
        const last_item_id = thread.last_permanent_item.item_id;
        const last_seen_item_id = thread.last_seen_at[instagram.user.pk].item_id;
        const user_pk = !thread.is_group && thread.users[0] && thread.users[0].pk;
        const thread_data = Object.assign({ last_item_id,
            user_pk }, thread);
        console.log('has_new_messages', last_item_id !== last_seen_item_id, last_item_id, last_seen_item_id);
        const has_new_messages = last_item_id !== last_seen_item_id;
        // !old_state[ thread_id ] || old_state[ thread_id ].last_item_id !== last_item_id
        if (has_new_messages) {
            new_messages[thread_id] = Object.assign({}, thread_data);
        }
        new_state[thread_id] = thread_data;
    });
    message_state = new_state;
    return new_messages;
});
const main = () => __awaiter(this, void 0, void 0, function* () {
    const new_messages = yield updateState();
    Object.keys(new_messages).forEach(thread_id => {
        console.log('thread_id', thread_id);
        console.log('message', new_messages[thread_id]);
        const { user_pk, items } = new_messages[thread_id];
        const { text, item_id } = items ? items[0] : {};
        console.log('data', user_pk, text);
        const options = { users: [user_pk], text: 'You said: ' + text };
        console.log('instagram.callMethod(send_direct_item, text, ', options, ')');
        console.log('instagram.callMethod(mark_direct_seen, ', thread_id, item_id, ')');
        // instagram.callMethod('send_direct_item', 'text', options)
        // instagram.callMethod('mark_direct_seen', thread_id, item_id)
    });
    console.log('Sent ', new_messages.length, ' messages');
});
yield updateState();
// setInterval(() => main(), 10000)
//# sourceMappingURL=message_service.js.map