import { FastifyPluginAsync } from "fastify";
import { TweetService } from "../../services/tweet.service";
import { CreateTweetBody } from "../../types";
import { tweetEmitter } from "../../events/tweet.emitter";
import { Tweet } from "../../entities/tweet";

const tweetService = new TweetService();

const tweets: FastifyPluginAsync = async (fastify) => {
  // GET /api/tweets
  fastify.get("/", async (request, reply) => {
    const tweets = await tweetService.getAllTweets();
    reply.send(tweets);
  });

  // POST /api/tweets
  fastify.post<{ Body: CreateTweetBody }>("/", {
    schema: {
      body: {
        type: "object",
        required: ["author", "content"],
        properties: {
          author: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const { author, content } = request.body;
      const tweet = await tweetService.createTweet(author, content);
      reply.status(201).send(tweet);
    },
  });
  fastify.get("/stream", async (request, reply) => {
    // 1. set headers
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const onNewTweet = (tweet: Tweet) => {
      reply.raw.write(`data: ${JSON.stringify(tweet)}\n\n`);
    };
    tweetEmitter.on("new-tweet", onNewTweet);

    const keepAlive = setInterval(() => {
      reply.raw.write(": ping\n\n");
    }, 30000);

    request.raw.on("close", () => {
      tweetEmitter.off("new-tweet", onNewTweet);
      clearInterval(keepAlive);
    });
  });
};

export default tweets;
