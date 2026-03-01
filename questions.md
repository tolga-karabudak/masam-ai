### Example Questions

```typescript
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1_adventure",
    question: "Bir RPG dünyasında uyanıyorsun. İlk nereye gidersin?",
    answers: [
      {
        text: "Karanlık bir zindana dalıp boss kesmeye 🗡️",
        vibeScores: { shadow_realm: 3, dragon_forge: 2, cyber_district: 1 }
      },
      {
        text: "Kristal göllerin olduğu bir elf köyüne 🧝",
        vibeScores: { frost_kingdom: 3, enchanted_grove: 2, sakura_garden: 1 }
      },
      {
        text: "Neon tabelalarla dolu bir siber şehre 🌃",
        vibeScores: { cyber_district: 3, neon_arcade: 2, phantom_vault: 1 }
      }
    ]
  },
  {
    id: "q2_weapon",
    question: "Savaşta hangi silahı seçersin?",
    answers: [
      {
        text: "Gölgelerde kaybolmamı sağlayan görünmezlik pelerini 🖤",
        vibeScores: { shadow_realm: 3, phantom_vault: 2 }
      },
      {
        text: "Kiraz çiçekleriyle süslü büyülü bir asa 🌸",
        vibeScores: { sakura_garden: 3, enchanted_grove: 2, sunset_lounge: 1 }
      },
      {
        text: "Lazer kılıç — tabii ki! ⚡",
        vibeScores: { neon_arcade: 3, cyber_district: 2, dragon_forge: 1 }
      }
    ]
  },
  {
    id: "q3_room",
    question: "Rüya odanı tarif et:",
    answers: [
      {
        text: "Sadece monitörümün ışığıyla aydınlanan karanlık bir mağara",
        vibeScores: { shadow_realm: 3, cyber_district: 1 }
      },
      {
        text: "Her şeyin bembeyaz ve minimalist olduğu ferah bir oda",
        vibeScores: { frost_kingdom: 3, command_bridge: 1 }
      },
      {
        text: "RGB LED'lerle gökkuşağına dönen bir oyun cenneti",
        vibeScores: { neon_arcade: 3, dragon_forge: 1 }
      },
      {
        text: "Bitkiler, ahşap masa ve pencereden gelen doğal ışık",
        vibeScores: { enchanted_grove: 3, sunset_lounge: 2 }
      }
    ]
  },
  {
    id: "q4_music",
    question: "Setup'ında hangi müzik çalar?",
    answers: [
      {
        text: "Dark ambient / synthwave 🎵",
        vibeScores: { shadow_realm: 2, cyber_district: 3, phantom_vault: 1 }
      },
      {
        text: "Lo-fi hip hop / chill beats 🎶",
        vibeScores: { frost_kingdom: 2, enchanted_grove: 2, sunset_lounge: 2 }
      },
      {
        text: "EDM / Bass-heavy tracks 🔊",
        vibeScores: { neon_arcade: 3, dragon_forge: 2 }
      },
      {
        text: "K-pop / J-pop / Anime OST 🎀",
        vibeScores: { sakura_garden: 3, neon_arcade: 1 }
      }
    ]
  },
  {
    id: "q5_snack",
    question: "Gece oyun maratonu! Yanında ne var?",
    answers: [
      {
        text: "Siyah kahve, başka bir şeye ihtiyacım yok ☕",
        vibeScores: { shadow_realm: 2, command_bridge: 2, frost_kingdom: 1 }
      },
      {
        text: "Enerji içeceği ve cips — tam gaz! 🥤",
        vibeScores: { neon_arcade: 2, dragon_forge: 2, cyber_district: 1 }
      },
      {
        text: "Matcha latte ve Japon atıştırmalıkları 🍵",
        vibeScores: { sakura_garden: 3, enchanted_grove: 1, sunset_lounge: 1 }
      },
      {
        text: "Özenle hazırlanmış bir cheese board 🧀",
        vibeScores: { sunset_lounge: 3, phantom_vault: 2 }
      }
    ]
  },
  {
    id: "q6_power",
    question: "Bir süper gücün olsa?",
    answers: [
      {
        text: "Görünmezlik — gölgelerde hareket etmek 👤",
        vibeScores: { shadow_realm: 3, phantom_vault: 1 }
      },
      {
        text: "Telekinezi — eşyaları düşünceyle düzenlemek 🧠",
        vibeScores: { frost_kingdom: 2, command_bridge: 3 }
      },
      {
        text: "Ateş kontrolü — her şeyi tutuşturmak 🔥",
        vibeScores: { dragon_forge: 3, neon_arcade: 1, sunset_lounge: 1 }
      },
      {
        text: "Doğayla konuşmak — bitkiler ve hayvanlarla iletişim 🌱",
        vibeScores: { enchanted_grove: 3, sakura_garden: 1 }
      }
    ]
  },
  {
    id: "q7_stream",
    question: "Twitch'te yayın açsan, arka planın nasıl olurdu?",
    answers: [
      {
        text: "Tamamen karanlık, sadece ekran ışığı — gizemli",
        vibeScores: { shadow_realm: 2, cyber_district: 2 }
      },
      {
        text: "Profesyonel stüdyo — 3 monitör, mikrofon, kamera",
        vibeScores: { command_bridge: 3, frost_kingdom: 1 }
      },
      {
        text: "Neon LED'ler, renkli ışıklar, parti ortamı",
        vibeScores: { neon_arcade: 3, cyber_district: 1 }
      },
      {
        text: "Rahat bir köşe, sıcak ışık, kitaplık",
        vibeScores: { sunset_lounge: 3, enchanted_grove: 1 }
      }
    ]
  }
];