export class Game {
    id: number;
    title: string;
    description: string;
    studio: string;
    genre: string;
    rating: number;
    coverImage: string;
    gallery: string[];

    // This will become obsolete when we implement dynamic categories, but for now it's a simple array of strings
    categories: string[];
    year: number;

    constructor(
        id: number,
        title: string,
        description: string,
        studio: string,
        genre: string,
        rating: number,
        coverImage: string,
        gallery: string[],
        categories: string[],
        year: number = 0
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.studio = studio;
        this.genre = genre;
        this.rating = rating;
        this.coverImage = coverImage;
        this.gallery = gallery;
        this.categories = categories;
        this.year = year;
    }
}
