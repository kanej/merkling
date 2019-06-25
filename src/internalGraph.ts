interface ISearchState {
  unmarked: Set<number>
  tempMarked: Set<number>
  marked: Set<number>
  l: number[]
}

export default class InternalGraph {
  private _matrix: Map<number, Set<number>>
  private _parents: Map<number, Set<number>>
  constructor() {
    this._matrix = new Map<number, Set<number>>()
    this._parents = new Map<number, Set<number>>()
  }

  link(from: number, to: number): void {
    this._populateAdjacencyMapping(this._matrix, from, to)
    this._populateAdjacencyMapping(this._parents, to, from)
  }

  _populateAdjacencyMapping(
    adjacencyMap: Map<number, Set<number>>,
    from: number,
    to: number
  ): void {
    if (!adjacencyMap.has(from)) {
      adjacencyMap.set(from, new Set<number>())
    }

    const linkedVertexes = adjacencyMap.get(from) as Set<number>
    linkedVertexes.add(to)
  }

  add(vertex: number): void {
    if (this._matrix.has(vertex)) {
      return
    }

    this._matrix.set(vertex, new Set<number>())
  }

  ancestorsOf(vertex: number): number[] {
    const searchState = this._setupSearchState()
    searchState.unmarked.delete(vertex)
    searchState.marked.add(vertex)
    this._visit(vertex, this._parents, searchState)
    return searchState.l.reverse()
  }

  topologicalSort(): number[] {
    const searchState = this._setupSearchState()

    while (searchState.unmarked.size > 0) {
      const unmarkedNode = searchState.unmarked.values().next().value
      searchState.unmarked.delete(unmarkedNode)

      this._visit(unmarkedNode, this._matrix, searchState)
    }

    return searchState.l
  }

  private _visit(
    vertex: number,
    adjacencyMap: Map<number, Set<number>>,
    searchState: ISearchState
  ): void {
    if (searchState.marked.has(vertex)) {
      return
    }

    if (searchState.tempMarked.has(vertex)) {
      throw new Error('Not a dag')
    }

    searchState.tempMarked.add(vertex)

    for (const child of adjacencyMap.get(vertex) || new Set<number>()) {
      this._visit(child, adjacencyMap, searchState)
    }

    searchState.tempMarked.delete(vertex)
    searchState.unmarked.delete(vertex)
    searchState.marked.add(vertex)
    searchState.l.push(vertex)
  }

  private _setupSearchState(): ISearchState {
    const allVertexes = new Set<number>(
      Array.from(this._matrix.keys()).concat(
        Array.from(this._matrix.values()).reduce(
          (acc: number[], s: Set<number>): number[] =>
            acc.concat(Array.from(s)),
          []
        )
      )
    )

    const searchState: ISearchState = {
      marked: new Set<number>(),
      tempMarked: new Set<number>(),
      unmarked: allVertexes,
      l: [] as number[]
    }

    return searchState
  }
}
