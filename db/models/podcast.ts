import { Document, model, Schema } from "mongoose";

interface IPodcastDoc extends Document {
    title: string;

    image: string;
}

const podcastSchema = new Schema<IPodcastDoc>({
    title: { type: String, required: true },

    image: { type: String },
});

export const PodcastModel = model<IPodcastDoc>("Podcast", podcastSchema);
