import schema from './schema';

export let message_state = {}
export let threads_state = {}

// handler = (text, { thread_id, thread }) => {
export let handler = (text, { thread_id, thread }) => {
  for (const elem of schema) {
    if (!elem.match) {
      return elem.reply
    }

    if (text.match(elem.match)) {
      return elem.reply
    }
  }
}

export const main = async (updateState, replyToThread) => {
  const new_messages = await updateState();

  Object.keys(new_messages).forEach(thread_id => {
    console.log('thread_id', thread_id)
    console.log('message', new_messages[thread_id])

    const { user_pk, items } = new_messages[thread_id]

    const { text, item_id } = items ? items[0] : {}
    console.log('data', user_pk, text)

    const reply_text = handler(text, { thread_id, thread: new_messages[thread_id] })

    const options = { users: [ user_pk ], text: reply_text }

    console.log('instagram.callMethod(send_direct_item, text, ', options, ')')
    console.log('instagram.callMethod(mark_direct_seen, ', thread_id, item_id, ')')

    replyToThread(thread_id, item_id, reply_text);
    //
    // instagram.callMethod('mark_direct_seen', thread_id, item_id)
    //
    // if (reply_text) {
    //   setTimeout(() => {
    //     instagram.callMethod('send_direct_item', 'text', options)
    //   }, 1000)
    // }
  })

  console.log('Sent ', Object.values(new_messages).length, ' messages')
}
