const quotes = {
  good: [
    "Hold on to this feeling. You deserve moments like this.",
    "Today reminded you what peace feels like. Let it stay a little longer.",
    "A good day is a gift. You earned this one.",
    "Smile if you want to. This moment is yours to keep.",
    "Not every day is easy, but today was kind to you. Breathe it in.",
    "You found light today. Let it warm you a while longer.",
    "Happiness doesn't need to be loud. This quiet joy is enough.",
    "Today was gentle with you. You were gentle with yourself.",
    "The best days aren't perfect. They're just felt. Like this one.",
    "You showed up today, and the day showed up for you.",
    "Some days just feel right. Let this be one of them.",
    "Carry this feeling with you. It belongs to you.",
  ],
  average: [
    "Not every day has to be extraordinary. You made it through today, and that's enough.",
    "An ordinary day is still a day you lived. That counts for something.",
    "You don't need a reason to feel at peace. Just being here is enough.",
    "Some days are quiet, and that's perfectly okay.",
    "You don't have to be productive every moment. Rest is productive too.",
    "Today was a page in your story. Not every page needs to be dramatic.",
    "A calm day is not a wasted day. It's a day you gave to yourself.",
    "You moved through today gently. That takes its own kind of strength.",
    "Average days build the foundation for extraordinary ones.",
    "The world kept spinning, and you kept going. That matters.",
    "Not everything has to mean something. Sometimes a day is just a day.",
    "You were here. You showed up. That's the whole assignment.",
  ],
  bad: [
    "Today was difficult, but today does not define you. Tomorrow is another beginning.",
    "Hard days don't last. But the strength you build from them does.",
    "You don't have to understand why today was hard. Just know that it's okay to feel it.",
    "Even on your worst days, you are still worthy of kindness. Especially your own.",
    "The heaviest days often come before the lightest ones.",
    "You survived today. That's not small. That's everything.",
    "It's okay to not be okay. Healing doesn't follow a schedule.",
    "Bad days end. They always do. And you always make it through.",
    "Be gentle with yourself tonight. You've carried enough today.",
    "You don't owe anyone an explanation for how you feel. Just feel it.",
    "This feeling is temporary. Your resilience is not.",
    "You're allowed to have hard days. You're also allowed to rest now.",
  ],
  stressful: [
    "You don't have to solve everything right now. Take a breath. Let this moment be yours.",
    "The weight you're carrying isn't yours alone. It's okay to set it down for a moment.",
    "Stress is not a sign of failure. It's a sign you care deeply. Now let yourself rest.",
    "Right now, nothing is required of you. Just breathe.",
    "The world can wait two minutes. You can't keep waiting to take care of yourself.",
    "You've handled hard things before. You'll handle this too. But not tonight.",
    "Let the tension go, even if just for this moment. You deserve a pause.",
    "Stress tells you that you're trying. Resting tells you that you're wise.",
    "Close your eyes. The to-do list will still be there. But so will you, stronger.",
    "Not everything urgent is important. Not everything important is urgent. Breathe.",
    "This moment is a gift you're giving yourself. Accept it without guilt.",
    "You're doing more than you think. Rest is not falling behind.",
  ],
};

export function getRandomQuote(mood) {
  const moodQuotes = quotes[mood];
  const index = Math.floor(Math.random() * moodQuotes.length);
  return moodQuotes[index];
}

export default quotes;
