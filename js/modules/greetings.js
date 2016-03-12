'use strict';

const greetings = ["What would you ask of death?",
"I am Forsaken.",
"Dark Lady watch over you.",
"What now?!",
"And you are....?",
"Victory for Sylvanas.",
"Trust no one.",
"Our time will come.",
"Beware, our enemies abound!",
"Remember, patience... discipline.",
"Hello.",
"Speak quickly!",
"Ya got my attention.",
"How are ya?",
"Lo!",
"Well met.",
"What's on your mind?",
"Great t' meet ya.",
"Watch yer back!",
"Be good!",
"What can I do fer ya?",
"Keep your feet on the ground.",
"Aye?",
"Interest ya'n a pint?",
"Me buy and trade.",
"Give or... take.",
"Me like... shiny.",
"Sale here.",
"Yes?",
"Greetings!",
"My, you're a tall one!",
"Hmmm, interesting.",
"Pleased to meet you!",
"Hey!",
"Salutations!",
"Need assistance?",
"Can I help you?",
"Hi, how are ya?",
"Time is money, friend!",
"Spit it out!",
"I got the best deals, anywhere!",
"I got what you need!",
"Ah, potential customer.",
"May I show you my wares?",
"Welcome, friend!",
"Yeah, what do you want?",
"Wazzup?",
"Hey there.",
"Greetings.",
"Light be with you.",
"What can I do for you?",
"Well met.",
"Need help?",
"King's honor, friend.",
"You need somethin'?",
"Farewell.",
"Be careful.",
"Go with honor, friend.",
"Safe travels!",
"Light bless you.",
"What's your problem?",
"Knock it off...",
"Can I help you?",
"Kinda busy.",
"You're getting on my nerves.",
"For the Alliance.",
"Elune be with you.",
"Ishnu-dal-dieb.",
"Elune light your path.",
"I am listening.",
"Del-nadres.",
"Till next we meet.",
"May the stars guide you.",
"What's your story?",
"What can I do for you?",
"I've got a bad feeling.",
"Get gabbing or get going.",
"Any friend of Greymane is a friend of mine.",
"The only honest merchants, a Gilnean merchant",
"Well ain't you a chippa lookin one?",
"Keep your chin up, ey",
"Zug zug!",
"For the Horde!",
"Dabu.",
"Blood and thunder!",
"Strength and honor!",
"Lok'tar!",
"Thrall hall!",
"Mok'ra!",
"What can I help you with?",
"Peace, friend.",
"May your blades never dull.",
"Strength.",
"What do you need?",
"Hail.",
"Greetings, traveler.",
"Greetings.",
"The winds guide you.",
"Walk with the Earth Mother.",
"Aah..I've been expecting you.",
"May the eternal sun shine upon thee.",
"What'cha want?",
"'Ello, mon.",
"Don't be shy.",
"Stay away from the Voodoo.",
"You come get da Voodoo.",
"What be on your mind?",
"Be cool mon!",
"Okay dokay",
"Who you be?",
"What troubles you?",
"May your nets always be full.",
"Yes, shalashka.",
"Let us visit for a while.",
"Stay warm!",
"Who is this that speaks?",
"Good hunting!",
"Your company is welcome."];

module.exports = {
	getRandomGreeting() {
		return greetings[Math.floor(Math.random() * greetings.length)];
	}
};
