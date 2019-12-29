import { add } from './index';

describe('src/index', () => {
  describe('add should', () => {
    test('return 2 when we add 1 and 1', async () => {
      expect(add(1, 1)).toEqual(2);
    });

    test('return 5 when we add 2 and 3', async () => {
      expect(add(2, 3)).toEqual(5);
    });
  });
});
