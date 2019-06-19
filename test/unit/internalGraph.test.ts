import InternalGraph from '../../src/internalGraph'

describe('internal graph', () => {
  describe('breadth first search', () => {
    it('should deal with a basic example', () => {
      const g = new InternalGraph()

      g.link(1, 2)
      g.link(2, 3)

      expect(g.topologicalSort()).toStrictEqual([3, 2, 1])
    })

    it('should deal with multiple entry points', () => {
      const g = new InternalGraph()

      g.link(1, 3)
      g.link(2, 3)
      g.link(3, 4)

      expect(g.topologicalSort()).toStrictEqual([4, 3, 1, 2])
    })
  })
})
