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

  describe('ancestor lookup', () => {
    it('should provide all ancestors of a vertex', () => {
      const g = new InternalGraph()

      g.link(1, 2)
      g.link(2, 3)
      g.link(2, 4)

      const ancestors = g.ancestorsOf(4)
      expect(ancestors).toStrictEqual([4, 2, 1])
    })

    it('should deal with having multiple ancestors of a single node', () => {
      const g = new InternalGraph()

      g.link(1, 3)
      g.link(2, 3)
      g.link(3, 4)
      g.link(3, 5)

      const ancestors = g.ancestorsOf(5)
      expect(ancestors).toStrictEqual([5, 3, 2, 1])
    })
  })
})
