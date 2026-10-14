import { HydratedDocument, InferSchemaType, Schema, model, models } from "mongoose";

const HeroContentSchema = new Schema(
  {
    badge: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    primaryCtaLabel: {
      type: String,
      required: true,
      trim: true,
    },
    primaryCtaHref: {
      type: String,
      required: true,
      trim: true,
    },
    secondaryCtaLabel: {
      type: String,
      required: true,
      trim: true,
    },
    secondaryCtaHref: {
      type: String,
      required: true,
      trim: true,
    },
    linkedinHref: {
      type: String,
      default: "https://www.linkedin.com/in/abdullah-mern/",
      trim: true,
    },
    palette: {
      primary: {
        type: String,
        default: "#F15BB5",
      },
      secondary: {
        type: String,
        default: "#4361EE",
      },
      accent: {
        type: String,
        default: "#2A9D8F",
      },
      particles: {
        type: String,
        default: "#2A9D8F",
      },
    },
  },
  {
    timestamps: true,
  }
);

export type HeroContentDocument = HydratedDocument<InferSchemaType<typeof HeroContentSchema>>;

const HeroContentModel = models.HeroContent || model("HeroContent", HeroContentSchema);

export default HeroContentModel;
