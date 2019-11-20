const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id })
      .orderBy('id', 'ASC')
  },

  getNextWord(db, language_id) {
    return db('language')
      .join('word', 'language.head', '=', 'word.id')
      .select(
        'word.original AS nextWord',
        'language.total_score AS totalScore',
        'word.correct_count AS wordCorrectCount',
        'word.incorrect_count AS wordIncorrectCount'
      )
      .where('language.id', '=', language_id)
      .first()
  },

  getFullNextWord(db, language_id) {
    return db('language')
      .join('word', 'language.head', '=', 'word.id')
      .select('*')
      .where('language.id', '=', language_id)
      .first()
  },

  updateLanguageWhenCorrect(db, id, result) {
    return db('language')
      .update({ head: result.nextWordID })
      .increment('total_score', 1)
      .where({ id })
  },

  updateLanguageWhenIncorrect(db, id, result) {
    return db('language')
      .update({ head: result.nextWordID })
      .where({ id })
      .then(() => {
        db('language')
          .select('*')
          .where({ id })
          .first()
      })
  },

  updateWord(db, id, data) {
    const {
      original,
      translation,
      memory_value,
      correct_count,
      incorrect_count,
      next,
    } = data
    return db('word')
      .update({
        original,
        translation,
        memory_value,
        correct_count,
        incorrect_count,
        next,
      })
      .where({ id })
      .then(() =>
        db('word')
          .select('*')
          .where({ id })
          .first()
      )
  },

  processGuess(wordList, guess) {
    // given a list of questions
    // take the first question
    const nextQ = wordList.head.value

    // shift the list to next question
    wordList.head = wordList.head.next
    // if the answer was correct
    if (nextQ.translation === guess) {
      // double the value of memory
      nextQ.memory_value = nextQ.memory_value * 2
      nextQ.correct_count++
    } else {
      // reset memory value to 1
      nextQ.memory_value = 1
      nextQ.incorrect_count++
    }
    // Move the question back amount equal to new memory value
    wordList.insertAtDepth(nextQ, nextQ.memory_value)

    // ensure actual db next values are correct according to list
    let tempNode = wordList.head
    while (tempNode.next !== null) {
      tempNode.value.next = tempNode.next.value.id
      tempNode = tempNode.next
    }
    tempNode.value.next = null
    // should be next word's original, correct and incorrect
    // plus the just guessed's translation and a bool
    // for if guess was right

    return {
      nextWord: wordList.head.value.original,
      wordCorrectCount: wordList.head.value.correct_count,
      wordIncorrectCount: wordList.head.value.incorrect_count,
      answer: nextQ.translation,
      isCorrect: nextQ.translation === guess,
      nextWordID: wordList.head.value.id,
    }
  },

  updateWordsFromList(db, wordList) {
    if (wordList.head === null) {
      return
    }

    let currNode = wordList.head
    while (currNode.next !== null) {
      let wordData = currNode.value
      LanguageService.updateWord(db, currNode.value.id, wordData)
      currNode = currNode.next
    }
  },
}

module.exports = LanguageService
