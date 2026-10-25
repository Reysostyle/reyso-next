// Video lessons taught by Reyhaneh, hosted on Aparat. `aparatId` is the
// video hash (the part of the embed URL after /videohash/); while it is
// empty the player shows "coming soon".

export type Lesson = {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumbnail: string;
  aparatId: string;
  description: string;
};
