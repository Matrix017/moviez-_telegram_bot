import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Markdown escape helper
function clean(text) {
  if (!text) return 'N/A';
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, (char) => '\\' + char);
}

// 🟢 /start
bot.start((ctx) => {
  const welcomeMessage = "Yo Flavian 🤖 Bot online\\!\nUse \\`\\/movie\\` for random 🍿\nOr \\`\\/movie dune\\` to search 🔍";
  ctx.reply(welcomeMessage, {
    parse_mode: 'MarkdownV2',
  });
});

// 🎥 /movie command
bot.command('movie', async (ctx) => {
  const userInput = ctx.message.text.split(' ').slice(1).join(' ').trim();

  try {
    let movies = [];

    if (userInput) {
      // Search for a specific movie
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie`,
        {
          params: {
            api_key: process.env.API_TOKEN,
            query: userInput,
            language: 'en-US',
            include_adult: true,
          }
        }
      );
      movies = response.data.results.slice(0, 5);

      if (movies.length === 0) {
        return ctx.reply(`Couldn't find anything for *${clean(userInput)}* 🤷‍♂️`, {
          parse_mode: 'MarkdownV2',
        });
      }

    } else {
      // Get random popular movies
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie`,
        {
          params: {
            api_key: process.env.API_TOKEN,
            language: 'en-US',
            sort_by: 'popularity.desc',
            include_adult: false,
            page: randomPage,
          }
        }
      );
      movies = response.data.results.slice(0, 10);
    }

    // Send each movie
    for (const [i, movie] of movies.entries()) {
      const title = clean(movie.title);
      const date = clean(movie.release_date);
      const overview = clean(movie.overview);
      const caption = `🎬 *${i + 1}\\. ${title}*\n📅 ${date}\n📝 ${overview}`;

      if (movie.backdrop_path) {
        const imageUrl = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
        await ctx.replyWithPhoto(imageUrl, {
          caption,
          parse_mode: 'MarkdownV2',
        });
      } else {
        await ctx.reply(caption, {
          parse_mode: 'MarkdownV2',
        });
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    ctx.reply("Bruh, something broke 🤕 Please try again.");
  }
});

// 🚀 Launch
bot.launch(() => {
  console.log("🎬 Flavian Bot is live and movie hunting!");
});
