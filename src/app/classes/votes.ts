export class Votes {
    userId: number;
    categoryId: number;
    gameId: number;

    constructor(userId: number, categoryId: number, gameId: number) {
        this.userId = userId;
        this.categoryId = categoryId;
        this.gameId = gameId;   
    }
}
