// All titles here are public-domain, so we can ship real text later without
// licensing headaches. Swap this file for an API call when you're ready.

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  blurb: string;
  spineColor: string;
  spineHeight: number; // 0.85 - 1 — small variation makes shelves feel hand-made
};

export type Section = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  x: number; // horizontal position in the room, as a % of room width
  books: Book[];
};

export const sections: Section[] = [
  {
    id: "classics",
    name: "Classics",
    tagline: "The ones everyone means to reread",
    accent: "#F5C77E",
    x: 12,
    books: [
      { id: "pride", title: "Pride and Prejudice", author: "Jane Austen", year: 1813, blurb: "Five sisters, one very rude first impression, and a village that cannot stop talking.", spineColor: "#C97B84", spineHeight: 1 },
      { id: "jane", title: "Jane Eyre", author: "Charlotte Bronte", year: 1847, blurb: "A governess with a spine of iron takes a post at a house that is hiding something upstairs.", spineColor: "#7C6BAA", spineHeight: 0.94 },
      { id: "moby", title: "Moby-Dick", author: "Herman Melville", year: 1851, blurb: "One captain's grudge against a whale, told by the only man left to tell it.", spineColor: "#4F7C8A", spineHeight: 0.99 },
    ],
  },
  {
    id: "romance",
    name: "Romance",
    tagline: "Longing, letters, weather",
    accent: "#F5A3B0",
    x: 27,
    books: [
      { id: "persuasion", title: "Persuasion", author: "Jane Austen", year: 1817, blurb: "Eight years after she was talked out of marrying him, he sails back into the room.", spineColor: "#E29AAE", spineHeight: 0.9 },
      { id: "wuthering", title: "Wuthering Heights", author: "Emily Bronte", year: 1847, blurb: "Love on the moors, which is less a romance than a haunting with two people in it.", spineColor: "#8C6E92", spineHeight: 1 },
      { id: "anna", title: "Anna Karenina", author: "Leo Tolstoy", year: 1878, blurb: "A woman risks everything she has for the one thing she wants.", spineColor: "#B26B7A", spineHeight: 0.97 },
    ],
  },
  {
    id: "thriller",
    name: "Thriller",
    tagline: "Do not start these at midnight",
    accent: "#7FB6D9",
    x: 42,
    books: [
      { id: "steps", title: "The Thirty-Nine Steps", author: "John Buchan", year: 1915, blurb: "A bored man finds a corpse in his flat and spends the rest of the book running.", spineColor: "#5B7FA6", spineHeight: 0.88 },
      { id: "hound", title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", year: 1902, blurb: "There is a curse on the moor, and something out there is large and hungry.", spineColor: "#3E5F6E", spineHeight: 0.96 },
      { id: "white", title: "The Woman in White", author: "Wilkie Collins", year: 1859, blurb: "A stranger on a moonlit road, an inheritance, and a conspiracy told by everyone involved.", spineColor: "#8FA9BF", spineHeight: 1 },
    ],
  },
  {
    id: "horror",
    name: "Horror",
    tagline: "Lamp stays on",
    accent: "#9B8AC4",
    x: 57,
    books: [
      { id: "dracula", title: "Dracula", author: "Bram Stoker", year: 1897, blurb: "Told in letters and diaries by people slowly realising what has moved in next door.", spineColor: "#6B4A6E", spineHeight: 1 },
      { id: "franken", title: "Frankenstein", author: "Mary Shelley", year: 1818, blurb: "A student builds a person and then refuses to be responsible for him.", spineColor: "#57666E", spineHeight: 0.93 },
      { id: "screw", title: "The Turn of the Screw", author: "Henry James", year: 1898, blurb: "Either the children are being haunted or the governess is unwell. Pick one.", spineColor: "#7E6B8F", spineHeight: 0.87 },
    ],
  },
  {
    id: "fantasy",
    name: "Fantasy",
    tagline: "Mind the door",
    accent: "#9FD8BE",
    x: 72,
    books: [
      { id: "alice", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", year: 1865, blurb: "A girl follows a well-dressed rabbit and loses all grip on scale and logic.", spineColor: "#78BFA0", spineHeight: 0.9 },
      { id: "oz", title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", year: 1900, blurb: "A house lands somewhere strange and the walk home takes the whole book.", spineColor: "#5FA98C", spineHeight: 0.95 },
      { id: "pan", title: "Peter Pan", author: "J. M. Barrie", year: 1911, blurb: "A boy who refuses to grow up recruits three children through a nursery window.", spineColor: "#84C4A8", spineHeight: 1 },
    ],
  },
  {
    id: "scifi",
    name: "Science Fiction",
    tagline: "Ideas with teeth",
    accent: "#8FB8F0",
    x: 87,
    books: [
      { id: "time", title: "The Time Machine", author: "H. G. Wells", year: 1895, blurb: "An inventor travels forward far enough to see what humanity turned into.", spineColor: "#6E8BC4", spineHeight: 0.92 },
      { id: "worlds", title: "The War of the Worlds", author: "H. G. Wells", year: 1898, blurb: "Cylinders land in the English countryside. The countryside does not cope.", spineColor: "#4E6BA8", spineHeight: 1 },
      { id: "leagues", title: "Twenty Thousand Leagues Under the Seas", author: "Jules Verne", year: 1870, blurb: "A captain, a submarine, and a grudge against the surface world.", spineColor: "#5E93A8", spineHeight: 0.96 },
    ],
  },
];

export const allBooks: Book[] = sections.flatMap((s) => s.books);

export function findBook(id: string | null): Book | undefined {
  if (!id) return undefined;
  return allBooks.find((b) => b.id === id);
}

export function findSection(id: string | null): Section | undefined {
  if (!id) return undefined;
  return sections.find((s) => s.id === id);
}
