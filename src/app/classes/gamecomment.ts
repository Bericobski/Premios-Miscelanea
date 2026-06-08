export class GameComment {
    id: number;
    user: string;
    message: string;
    gameId: number;
    categoryId: number;

    constructor(id: number, user: string, message: string, gameId: number, categoryId: number) {
        this.id = id;
        this.user = user;
        this.message = message;
        this.gameId = gameId;
        this.categoryId = categoryId;
    }
}
