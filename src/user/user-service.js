const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UserService = {
  hasUserWithUserName(db, username) {
    return db('user')
      .where({ username })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('user')
      .returning('*')
      .then(([user]) => user)
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character'
    }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
    }
  },
  populateUserWords(db, user_id) {
    return db.transaction(async trx => {
      const [languageId] = await trx
        .into('language')
        .insert([{ name: 'Russian', user_id }], ['id'])

      // when inserting words,
      // we need to know the current sequence number
      // so that we can set the `next` field of the linked language
      const seq = await db
        .from('word_id_seq')
        .select('last_value')
        .first()

      const languageWords = [
        ['Доброе утро (Dobraye utro)', 'Good morning', 2],
        [
          'Вы говорите по-английски? (Vi govorite po Angliski?)',
          'Do you speak English?',
          3,
        ],
        ['Как Вы поживаете? (kak tvoi dela?)', 'How are you?', 4],
        ['Я не понимаю (Ya ne ponimayu)', 'I do not understand', 5],
        ['Спасибо (Spasiba)', 'Thank you', 6],
        ['Пожалуйста (Pazhalusta)', 'You are welcome', 7],
        ['До свидания (Do svidaniya)', 'Goodbye', 8],
        ['Добрый вечер (Dobriy vecher)', 'Good evening', 9],
        [
          'Извините, где туалет? (Izvinite, gde tualet?)',
          'Excuse me, where’s the toilet?',
          10,
        ],
        ['Привет (Privet)', 'Hi', null],
      ]

      const [languageHeadId] = await trx.into('word').insert(
        languageWords.map(([original, translation, nextInc]) => ({
          language_id: languageId.id,
          original,
          translation,
          next: nextInc ? Number(seq.last_value) + nextInc : null,
        })),
        ['id']
      )

      await trx('language')
        .where('id', languageId.id)
        .update({
          head: languageHeadId.id,
        })
    })
  },
}

module.exports = UserService
