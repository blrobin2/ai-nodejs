import { openai } from './openai.js'
import { OpenAIEmbeddings } from '@langchain/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'

const question = process.argv[2] || 'hi'
console.log(question)
const video = 'https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn'

export const createStore = (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings())

export const docsFromYTVideo = async (video) => {
  const loader = YoutubeLoader.createFromUrl(video, {
    language: 'en',
    addVideoInfo: true,
  })
  return loader.load(
    new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  )
}

export const docsFromPDF = async () => {
  const loader = new PDFLoader('./xbox.pdf')
  return loader.load(
    new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  )
}

const loadStore = async () => {
  const videoDocs = await docsFromYTVideo(video)
  const pdfDocs = await docsFromPDF()
  return createStore(pdfDocs)
}

const query = async () => {
  const store = await loadStore()
  const results = await store.similaritySearch(question, 2)

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'assistant',
        content:
          'You are a helpful AI assistant. Answer questions to your best ability.',
      },
      {
        role: 'user',
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
            Question: ${question}
            
            Context: ${results.map((r) => r.pageContent).join('\n')}`,
      },
    ],
  })
  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${results
      .map((r) => r.metadata.source)
      .join(', ')}`
  )
}

query()
