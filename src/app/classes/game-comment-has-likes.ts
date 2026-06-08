export class GameCommentHasLikes {
    user: string;
    commentId: number; 

    constructor(user: string, commentId: number) {
        this.user = user;
        this.commentId = commentId;
    }
}
