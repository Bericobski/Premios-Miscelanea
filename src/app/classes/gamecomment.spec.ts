import { GameComment } from './gamecomment';

describe('GameComment', () => {
  it('should create an instance', () => {
    expect(new GameComment('1', 1, 1, 'uid-1', 'Bruno', 'Amazing game!', new Date(), null, 0, [], [])).toBeTruthy();
  });

  it('reports whether a given uid has liked the comment', () => {
    const comment = new GameComment('1', 1, 1, 'uid-1', 'Bruno', 'Amazing game!', new Date(), null, 1, ['uid-2'], []);

    expect(comment.isLikedBy('uid-2')).toBe(true);
    expect(comment.isLikedBy('uid-3')).toBe(false);
    expect(comment.isLikedBy(null)).toBe(false);
  });
});
