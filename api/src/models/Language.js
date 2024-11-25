import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add some common languages when the collection is empty
languageSchema.statics.initializeCommonLanguages = async function () {
  try {
    const count = await this.countDocuments();
    if (count === 0) {
      const commonLanguages = [
        { name: "Arabic", code: "ar" },
        { name: "English", code: "en" },
        { name: "Spanish", code: "es" },
        { name: "French", code: "fr" },
        { name: "Chinese", code: "zh" },
        { name: "Russian", code: "ru" },
        { name: "German", code: "de" },
        { name: "Japanese", code: "ja" },
        { name: "Korean", code: "ko" },
        { name: "Italian", code: "it" },
      ];
      await this.insertMany(commonLanguages);
      console.log("Common languages initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing common languages:", error);
  }
};

const Language = mongoose.model("Language", languageSchema);

// Initialize common languages immediately after model creation
Language.initializeCommonLanguages();

export default Language;
