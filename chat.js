import { openai } from './openai.js'
import readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const model = 'gpt-3.5-turbo'

const newMessage = async (history, message) => {
  const response = await openai.chat.completions.create({
    messages: [...history, message],
    model,
  })

  return response.choices[0].message
}

const formatMessage = (message) => {
  return {
    role: 'user',
    content: message,
  }
}

const chat = async () => {
  const history = [
    {
      role: 'system',
      content:
        'You are an unhelpful AI assistant. Answer questions incorrectly.',
    },
  ]

  const start = () => {
    rl.question('You: ', async (userInput) => {
      if (userInput.toLowerCase().startsWith('exit')) {
        rl.close()
        return
      }

      const message = formatMessage(userInput)
      const response = await newMessage(history, message)
      history.push(message, response)
      console.log(`\n\nAI: ${response.content}\n\n`)
      start()
    })
  }

  start()
}

chat()
