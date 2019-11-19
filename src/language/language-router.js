const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../linked_list')

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
  const { guess } = req.body
  if (!guess) {
    return res.status(400).json({ error: "Missing 'guess' in request body" })
  }

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
  await words.forEach(word => userWordList.insertLast(word))
  const result = await LanguageService.processGuess(userWordList, guess)
  let response
  let userData
  
  // correct answers produce values greater than 1 always,
  // assume if the value is not 1, it was right
  if (result.isCorrect) {
    // update language.total_score to be +1
    // update language.head to be result.next
    
    await LanguageService.updateLanguageWhenCorrect(req.app.get('db'), req.language.id, result)
    // update word.next based on userWordList order
    await LanguageService.updateWordsFromList(req.app.get('db'), userWordList)
    userData = await LanguageService.getUsersLanguage(req.app.get('db'), req.user.id)

    response = {
      nextWord: result.original,
      totalScore: userData.total_score,
      wordCorrectCount: result.correct_count,
      wordIncorrectCount: result.incorrect_count,
      answer: result.prevAnswer,
      isCorrect: true
    }

    return res.status(200).json(response) 
  } else {
    await LanguageService.updateLanguageWhenIncorrect(req.app.get('db'), req.language.id, result)
    await LanguageService.updateWordsFromList(req.app.get('db'), userWordList)
    userData = await LanguageService.getUsersLanguage(req.app.get('db'), req.user.id)
    response = {
      nextWord: result.original,
      totalScore: userData.total_score,
      wordCorrectCount: result.correct_count,
      wordIncorrectCount: result.incorrect_count,
      answer: result.prevAnswer,
      isCorrect: false
    }
    return res.status(200).json(response) 
  }

  // return res.status(200).json({ userWordList })

})

module.exports = languageRouter
