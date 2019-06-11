interface ISearchState {
  unmarked: Set<number>
  tempMarked: Set<number>
  marked: Set<number>
  l: number[]
}

export default class InternalGraph {
  private _matrix: Map<number, Set<number>>
  constructor() {
    this._matrix = new Map<number, Set<number>>()
  }

  link(from: number, to: number): void {
    if (!this._matrix.has(from)) {
      this._matrix.set(from, new Set<number>())
    }

    const adjecencyMap = this._matrix.get(from) as Set<number>

    adjecencyMap.add(to)
  }

  topologicalSort(): number[] {
    const allVertexes = new Set<number>(
      Array.from(this._matrix.keys()).concat(
        Array.from(this._matrix.values()).flatMap(
          (s: Set<number>): number[] => Array.from(s)
        )
      )
    )

    const searchState: ISearchState = {
      marked: new Set<number>(),
      tempMarked: new Set<number>(),
      unmarked: allVertexes,
      l: [] as number[]
    }

    while (searchState.unmarked.size > 0) {
      const unmarkedNode = searchState.unmarked.values().next().value
      searchState.unmarked.delete(unmarkedNode)

      this._visit(unmarkedNode, searchState)
    }

    return searchState.l
  }

  private _visit(vertex: number, searchState: ISearchState): void {
    if (searchState.marked.has(vertex)) {
      return
    }

    if (searchState.tempMarked.has(vertex)) {
      throw new Error('Not a dag')
    }

    searchState.tempMarked.add(vertex)

    for (const child of this._matrix.get(vertex) || new Set<number>()) {
      this._visit(child, searchState)
    }

    searchState.tempMarked.delete(vertex)
    searchState.unmarked.delete(vertex)
    searchState.marked.add(vertex)
    searchState.l.push(vertex)
  }
}
