import {load} from '../src/data/emojiData.ts'
import type {EmojiItem} from '../src/data/emojiData.ts'

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  const endpoint = process.env.OPENAI_ENDPOINT

  if (!endpoint) {
    throw new Error('OPENAI_ENDPOINT environment variable is required')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}\n${await response.text()}`)
  }

  const data: OpenAIResponse = await response.json() as OpenAIResponse
  return data.choices[0]?.message?.content?.trim() || ''
}

async function generateDescriptions() {
  const emojiData = load()
  const emojisToProcess = emojiData.items
    .filter(item => item.variationOf === null)

  console.log(`Processing ${emojisToProcess.length} emojis...`)

  for (const [index, item] of emojisToProcess.entries()) {
    try {
      const outputFile = Bun.file(`../src/assets/desc/${item.emoji}.txt`)
      if (await outputFile.exists()) {
        continue
        // await outputFile.delete()
      }

      const prompt = createPrompt(item)
      const description = await callOpenAI(prompt)

      const writer = outputFile.writer()
      writer.write(
        description
          .replace("**Description:**", "").trim()
          .replace("**Used for:**", "#")
          .replace(/\s+$/g, "")
      )

      console.log(`[${index + 1}/${emojisToProcess.length}] ${item.emoji}`)

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 250))

    } catch (error) {
      console.error(`Error processing ${item.emoji}:`, error)
    }
  }
}

function createPrompt(item: EmojiItem) {
  let prompt = `Generate a description with a couple of phrases for the following emoji: ${item.emoji}`
  prompt += `\ntitle: ${item.title}`
  if (item.keywords.length > 0) {
    prompt += `\nkeywords: ${item.keywords.join(', ')}`
  }
  prompt += `\nDo not include the emoji in the description. 
Do not include the title or keywords in the description. 
Include a "Used for" section with a list of minimum 2 to maximum 5 common uses. 
Use the following format:\n\n**Description:**\n<description>\n\n**Used for:**\n- <use 1>\n- <use 2>\n- <use N>\n\n`
  return prompt
}

generateDescriptions().catch(console.error)
