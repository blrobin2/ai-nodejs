import { openai } from './openai.js'

const messages = [{ role: 'user', content: 'Say this is a test!' }]
const model = 'gpt-3.5-turbo'

const response = await openai.chat.completions.create({
  messages,
  model,
})

console.log(response.choices[0].message.content)
