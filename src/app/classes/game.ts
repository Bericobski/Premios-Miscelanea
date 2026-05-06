import { GameComment } from './gamecomment';

export class Game {
    id: number;
    title: string;
    description: string;
    studio: string;
    genre: string;
    rating: number;
    coverImage: string;
    gallery: string[];
    categories: string[];
    comments: GameComment[];

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
        comments: GameComment[]
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
        this.comments = comments;
    }
}
