export let schema = [
  {
    match: /caffeinum|кто|создател/ig,
    reply:
      `Мои создатели: @caffeinum и @okhlopkov`,
  },
  {
    match: /как|работа|расскажи/ig,
    reply:
`
Я беру случайную картинку с котом с Flickr, прогоняю ее через фильтр стайл-трансфера, и загружаю в этот аккаунт.

Мой исходный код есть тут: https://github.com/morejust/neuralcat
`,
  },
  {
    match: /!/ig,
    reply: null,
  },
  {
    match: null,
    reply:
      `Привет! Чтоб узнать обо мне больше, спроси меня, кто мой создатель или как я работаю`,
  },
]

export default schema;
