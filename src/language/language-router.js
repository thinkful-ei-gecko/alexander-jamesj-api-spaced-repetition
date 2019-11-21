const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../linked_list')
const xss = require('xss')

const languageRouter = express.Router()

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    )

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      })

    req.language = language
    next()
  } catch (error) {
    next(error)
  }
})

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    )

    res.json({
      language: req.language,
      words,
    })
    next()
  } catch (error) {
    next(error)
  }
})

languageRouter.get('/head', async (req, res, next) => {
  try {
    const nextWord = await LanguageService.getNextWord(
      req.app.get('db'),
      req.language.id
    )
    res.json({ ...nextWord })
    next()
  } catch (error) {
    next(error)
  }
})

languageRouter.post('/guess', express.json(), async (req, res, next) => {
  let { guess } = req.body
  guess = xss(guess)

  if (!guess) {
    return res.status(400).json({ error: "Missing 'guess' in request body" })
  }

try {
  const words = await LanguageService.getLanguageWords(
    req.app.get('db'),
    req.language.id
  )
  const userWordList = new LinkedList()
  const currentUserData = await LanguageService.getUsersLanguage(req.app.get('db'), req.user.id)
  
  let startID = currentUserData.head
  while (startID !== null) {
    let wordToAdd = words.find(word => word.id === startID)
    await userWordList.insertLast(wordToAdd)
    startID = wordToAdd.next
  }
  
  const result = await LanguageService.processGuess(userWordList, guess)
  // update word.next based on userWordList order
  await LanguageService.updateWordsFromList(req.app.get('db'), userWordList)

  if (result.isCorrect) {
    await LanguageService.updateLanguageWhenCorrect(req.app.get('db'), req.language.id, result)
  } else {
    await LanguageService.updateLanguageWhenIncorrect(req.app.get('db'), req.language.id, result)
  }
  
  const userData = await LanguageService.getUsersLanguage(req.app.get('db'), req.user.id)
  delete result.nextWordID
  res.json({
    ...result,
    totalScore: userData.total_score,
  })
  next()
} catch (error) {
  next(error)
}

})

module.exports = languageRouter
