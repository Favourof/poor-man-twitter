import { AppDataSource } from "../database/data-source";
import { Tweet } from "../entities/tweet";
import { tweetEmitter } from "../events/tweet.emitter";

export class TweetService {
  private repo = AppDataSource.getRepository(Tweet);

  async getAllTweets() {
    return this.repo.find({
      order: {
        createdAt: "DESC",
      },
    });
  }

  async createTweet(author: string, content: string) {
    const tweet = this.repo.create({ author, content });
    const saved = await this.repo.save(tweet)
     tweetEmitter.emit("new-tweet", saved)
     return saved
  }
}
