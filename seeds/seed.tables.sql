BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Russian', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'Доброе утро (Dobraye utro)', 'Good morning', 2),
  (2, 1, 'Вы говорите по-английски? (Vi govorite po Angliski?)', 'Do you speak English?', 3),
  (3, 1, 'Как Вы поживаете? (kak tvoi dela?)', 'How are you?', 4),
  (4, 1, 'Я не понимаю (Ya ne ponimayu)', 'I do not understand', 5),
  (5, 1, 'Спасибо (Spasiba)', 'Thank you', 6),
  (6, 1, 'Пожалуйста (Pazhalusta)', 'You are welcome', 7),
  (7, 1, 'До свидания (Do svidaniya)', 'Goodbye', 8),
  (8, 1, 'Добрый вечер (Dobriy vecher)', 'Good evening', 9),
  (9, 1, 'Извините, где туалет? (Izvinite, gde tualet?)', 'Excuse me, where’s the toilet?', 10),
  (10, 1, 'Привет (Privet)', 'Hi', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
