import { Achievement, Category, Goal, Quote, Task } from "./types";

export const categories: Category[] = [
  { key: "work", title: "Работа", icon: "briefcase", accent: "#0A84FF" },
  { key: "discipline", title: "Дисциплина", icon: "shield", accent: "#111827" },
  { key: "study", title: "Учёба", icon: "book-open", accent: "#4F46E5" },
  { key: "life", title: "Жизнь", icon: "sparkles", accent: "#06B6D4" },
  { key: "money", title: "Деньги", icon: "wallet", accent: "#10B981" },
  { key: "health", title: "Здоровье", icon: "dumbbell", accent: "#0A84FF" },
];

export const defaultTasks: Task[] = [
  // Работа
  { id: "work-key-task", category: "work", title: "Закрыть ключевую задачу", points: 25, penalty: -10 },
  { id: "work-project-stage", category: "work", title: "Завершить этап проекта", points: 35, penalty: -10 },
  { id: "work-project", category: "work", title: "Завершить проект", points: 60, penalty: -15 },
  { id: "work-reviews", category: "work", title: "Получить 5 отзывов клиентов", points: 40, penalty: 0 },
  { id: "work-contacts", category: "work", title: "Сделать 5 рабочих касаний", points: 20, penalty: -5 },
  { id: "work-offer", category: "work", title: "Отправить важное КП", points: 15, penalty: 0 },
  { id: "work-deep", category: "work", title: "2 часа deep work", points: 20, penalty: -5 },
  { id: "work-report", category: "work", title: "Подготовить кейс / отчёт", points: 20, penalty: 0 },

  // Дисциплина
  { id: "disc-wakeup-7", category: "discipline", title: "Проснуться до 07:00", points: 20, penalty: -10 },
  { id: "disc-wakeup-8", category: "discipline", title: "Проснуться до 08:00", points: 10, penalty: -5 },
  { id: "disc-bed", category: "discipline", title: "Заправить кровать", points: 5, penalty: 0 },
  { id: "disc-dishes", category: "discipline", title: "Помыть посуду", points: 5, penalty: 0 },
  { id: "disc-clean", category: "discipline", title: "Быстрая уборка", points: 10, penalty: 0 },
  { id: "disc-general-clean", category: "discipline", title: "Генеральная уборка", points: 30, penalty: 0 },
  { id: "disc-plan", category: "discipline", title: "Составить план дня", points: 10, penalty: -5 },
  { id: "disc-no-phone", category: "discipline", title: "30 минут без соцсетей утром", points: 15, penalty: -5 },
  { id: "disc-workplace", category: "discipline", title: "Разобрать рабочее место", points: 10, penalty: 0 },

  // Учёба
  { id: "study-read-10", category: "study", title: "Прочитать 10 страниц", points: 10, penalty: -5 },
  { id: "study-read-20", category: "study", title: "Прочитать 20 страниц", points: 18, penalty: -5 },
  { id: "study-english", category: "study", title: "Урок по английскому", points: 15, penalty: -5 },
  { id: "study-video", category: "study", title: "Обучающее видео", points: 10, penalty: 0 },
  { id: "study-notes", category: "study", title: "Законспектировать материал", points: 12, penalty: 0 },
  { id: "study-module", category: "study", title: "Завершить модуль курса", points: 20, penalty: 0 },
  { id: "study-practice", category: "study", title: "Практика навыка 30 минут", points: 15, penalty: -5 },
  { id: "study-summary", category: "study", title: "Краткий вывод по изученному", points: 10, penalty: 0 },

  // Жизнь
  { id: "life-phone-free", category: "life", title: "30 минут без телефона", points: 10, penalty: 0 },
  { id: "life-call", category: "life", title: "Позвонить близкому", points: 10, penalty: 0 },
  { id: "life-family", category: "life", title: "Время с семьёй / партнёром", points: 20, penalty: 0 },
  { id: "life-good", category: "life", title: "Сделать доброе дело", points: 15, penalty: 0 },
  { id: "life-hobby", category: "life", title: "30 минут на хобби", points: 15, penalty: 0 },
  { id: "life-walk", category: "life", title: "Прогулка для себя", points: 12, penalty: 0 },
  { id: "life-cozy", category: "life", title: "Навести уют", points: 10, penalty: 0 },
  { id: "life-thanks", category: "life", title: "Поблагодарить человека", points: 8, penalty: 0 },

  // Деньги
  { id: "money-1000", category: "money", title: "Заработать 1000 ₽", points: 20, penalty: 0 },
  { id: "money-2000", category: "money", title: "Заработать 2000 ₽", points: 35, penalty: 0 },
  { id: "money-5000", category: "money", title: "Заработать 5000 ₽", points: 60, penalty: 0 },
  { id: "money-save-day", category: "money", title: "Не потратить всё день в день", points: 15, penalty: -10 },
  { id: "money-save-10", category: "money", title: "Отложить 10% дохода", points: 20, penalty: 0 },
  { id: "money-track", category: "money", title: "Записать доходы и расходы", points: 10, penalty: 0 },
  { id: "money-no-impulse", category: "money", title: "Без импульсивной покупки", points: 15, penalty: 0 },
  { id: "money-charity", category: "money", title: "10% в благотворительность", points: 20, penalty: 0 },

  // Здоровье
  { id: "health-charge", category: "health", title: "Утренняя зарядка", points: 10, penalty: -5 },
  { id: "health-pushups", category: "health", title: "10 отжиманий", points: 8, penalty: 0 },
  { id: "health-abs", category: "health", title: "10 раз на пресс", points: 8, penalty: 0 },
  { id: "health-squats", category: "health", title: "30 приседаний", points: 10, penalty: 0 },
  { id: "health-8000", category: "health", title: "8000 шагов", points: 15, penalty: -5 },
  { id: "health-10000", category: "health", title: "10000 шагов", points: 20, penalty: -5 },
  { id: "health-gym", category: "health", title: "Сходить в спортзал", points: 25, penalty: 0 },
  { id: "health-game", category: "health", title: "Активная игра / спорт", points: 15, penalty: 0 },
  { id: "health-run", category: "health", title: "Вечерняя пробежка", points: 20, penalty: 0 },
  { id: "health-sleep-00", category: "health", title: "Сон до 00:00", points: 15, penalty: -10 },
  { id: "health-sleep-23", category: "health", title: "Сон до 23:00", points: 25, penalty: -10 },
  { id: "health-vitamins", category: "health", title: "Выпить витамины", points: 5, penalty: 0 },
  { id: "health-water", category: "health", title: "Норма воды", points: 10, penalty: 0 },
  { id: "health-no-junk", category: "health", title: "Без вредного вечером", points: 10, penalty: 0 },
];

export const defaultGoals: Goal[] = [
  { id: "daily-score", type: "daily", title: "Цель дня", target: 80, unit: "points" },
  { id: "monthly-money", type: "monthly", title: "Заработать за месяц", target: 100000, unit: "rub" },
  { id: "year-million", type: "yearly", title: "Заработать 1 000 000 ₽", target: 1000000, unit: "rub" },
  { id: "year-car", type: "yearly", title: "Купить автомобиль", target: 1, unit: "custom" },
  { id: "year-flat", type: "yearly", title: "Купить квартиру", target: 1, unit: "custom" },
  { id: "year-vacation", type: "yearly", title: "Слетать в отпуск", target: 1, unit: "custom" },
  { id: "year-diploma", type: "yearly", title: "Получить диплом", target: 1, unit: "custom" },
];

export const achievements: Achievement[] = [
  { code: "first-day", title: "Первый шаг", description: "Первый отмеченный день", icon: "👣", rarity: "base" },
  { code: "start-victory", title: "Начало побед", description: "3 дня активности", icon: "🚀", rarity: "base" },
  { code: "week-game", title: "Неделя в игре", description: "7 дней активности", icon: "🔥", rarity: "rare" },
  { code: "strong-day", title: "Сильный день", description: "100+ баллов за день", icon: "⭐", rarity: "rare" },
  { code: "iron-discipline", title: "Железная дисциплина", description: "10 дисциплинарных задач", icon: "🛡️", rarity: "rare" },
  { code: "reader", title: "Читатель", description: "10 учебных отметок", icon: "📚", rarity: "base" },
  { code: "money-pulse", title: "Денежный импульс", description: "5 финансовых побед", icon: "💰", rarity: "rare" },
  { code: "shape", title: "В форме", description: "10 задач здоровья", icon: "💪", rarity: "rare" },
  { code: "balance", title: "Баланс жизни", description: "Все сферы в плюсе за период", icon: "⚖️", rarity: "epic" },
  { code: "month", title: "Месяц побед", description: "30 отмеченных дней", icon: "🏆", rarity: "epic" },
  { code: "legend", title: "Победитель года", description: "Закрыта годовая цель", icon: "👑", rarity: "legend" },
];

export const quotes: Quote[] = [
  { author: "Стив Джобс", quote: "Оставайтесь голодными. Оставайтесь безрассудными." },
  { author: "Аристотель", quote: "Мы — это то, что мы постоянно делаем." },
  { author: "Платон", quote: "Победа над собой — первая и лучшая из побед." },
  { author: "Александр Суворов", quote: "Тяжело в учении — легко в бою." },
  { author: "Теодор Рузвельт", quote: "Делай, что можешь, с тем, что имеешь, там, где ты есть." },
  { author: "Джек Лондон", quote: "Вдохновения ждать нельзя. За ним надо гоняться с дубинкой." },
  { author: "Достоевский", quote: "Надо любить жизнь больше, чем смысл жизни." },
  { author: "Лев Толстой", quote: "Истинная сила человека не в порывах, а в спокойной устойчивости." },
  { author: "Стивен Хокинг", quote: "Пока есть жизнь, есть надежда." },
  { author: "Жозе Моуриньо", quote: "Давление — это часть успеха." },
  { author: "Евангелие от Матфея 7:7", quote: "Просите, и дано будет вам; ищите, и найдёте." },
  { author: "Роберт Кийосаки", quote: "Не бойтесь проигрывать. Бойтесь не учиться." },
];
