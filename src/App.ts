import {
  IgApiClient,
  DirectThreadEntity,
} from 'instagram-private-api';

import { main } from './message_service';
import { login } from './login';

let message_state = {};

const ig = new IgApiClient();

export const init = (async () => {
  const user = await login(ig);

  const replyToThread = async (thread_id, item_id, reply_text) => {
    const thread = await ig.entity.directThread(thread_id);

    thread.markItemSeen(item_id);

    if (reply_text) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      thread.broadcastText(reply_text);
    }
  }

  const new_messages = await updateState(user, ig);

  console.log('new_messages', new_messages);

  setInterval(() => {
    main(() => updateState(user, ig), replyToThread)
  }, 5000)

});

const updateState = async (viewer, client: IgApiClient) => {
  const threads = await client.feed.directInbox().items();

  let old_state = message_state
  let new_state = {}
  let new_messages = {}

  threads.forEach(thread => {
    const thread_id = thread.thread_id

    const last_item_id = thread.last_permanent_item.item_id
    const last_seen_item_id = thread.last_seen_at && thread.last_seen_at[viewer.pk].item_id
    const user_pk = !thread.is_group && thread.users[0] && thread.users[0].pk

    const thread_data = {
      last_item_id,
      last_seen_item_id,
      user_pk,
      ...thread,
    }

    console.log('has_new_messages',
      last_item_id !== last_seen_item_id,
      last_item_id, last_seen_item_id,
    )

    const has_new_messages = last_item_id !== last_seen_item_id

    if (has_new_messages) {
      new_messages[ thread_id ] = thread_data
    }

    new_state[ thread_id ] = thread_data
  })

  message_state = new_state

  return new_messages
}
