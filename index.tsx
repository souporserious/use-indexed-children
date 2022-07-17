import * as React from "react"

const MaxIndexContext = React.createContext<number[]>([])
const IndexContext = React.createContext<string>("")

/**
 * Parses a numerical string as an index path.
 *
 * @example
 * parseIndexPath('028') -> [0, 2, 8]
 */
export function parseIndexPath(indexPathString: string) {
  return indexPathString.split("").map((index) => parseInt(index, 10))
}

/** Returns the index path data based on the closest useIndexedChildren. */
export function useIndex() {
  const maxIndexPath = React.useContext(MaxIndexContext)
  const indexPathString = React.useContext(IndexContext)
  const indexPath = React.useMemo(
    () => parseIndexPath(indexPathString),
    [indexPathString]
  )
  const maxIndex = maxIndexPath[maxIndexPath.length - 1]
  const index = indexPath[indexPath.length - 1]

  if (indexPathString === "") {
    return null
  }

  return {
    maxIndex,
    maxIndexPath,
    index,
    indexPath,
    isFirst: index === 0,
    isLast: index === maxIndex,
    isEven: index % 2 === 0,
    isOdd: Math.abs(index % 2) === 1,
  }
}

/** Provides the current index path for each child. */
export function useIndexedChildren(children: React.ReactNode) {
  const parentMaxIndexPath = React.useContext(MaxIndexContext)
  const indexPathString = React.useContext(IndexContext)
  const childrenCount = React.Children.count(children)
  const maxIndexPath = React.useMemo(
    () => parentMaxIndexPath.concat(childrenCount),
    [childrenCount]
  )

  return (
    <MaxIndexContext.Provider value={maxIndexPath}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child) ? (
          <IndexContext.Provider
            key={child.key}
            value={indexPathString + index.toString()}
          >
            {child}
          </IndexContext.Provider>
        ) : (
          child
        )
      )}
    </MaxIndexContext.Provider>
  )
}

/** Finds a descendant child based on its index path. */
export function findDescendant(
  children: React.ReactNode,
  indexPath: string
): React.ReactElement {
  let path = parseIndexPath(indexPath)

  while (path.length > 0) {
    let searchIndex = path.shift()

    if (React.isValidElement(children)) {
      children = (children as React.ReactElement).props.children
    }

    children = React.Children.toArray(children).find(
      (_, childIndex) => childIndex === searchIndex
    )
  }

  return children as React.ReactElement
}

/** Returns a memoized descendant child using its index path. */
export function useDescendant(
  children: React.ReactNode,
  indexPath: string | null
): React.ReactElement | null {
  return React.useMemo(
    () => (indexPath ? findDescendant(children, indexPath) : null),
    [children, indexPath]
  )
}
