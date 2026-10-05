export class Votes {
    userId: number;
    categoryId: number;
    gameId: number;
    createdAt: Date;

    constructor(userId: number, categoryId: number, gameId: number, createdAt: Date) {
        this.userId = userId;
        this.categoryId = categoryId;
        this.gameId = gameId;
        this.createdAt = createdAt;
    }
}
