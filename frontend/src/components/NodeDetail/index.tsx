import type { FlatNode } from '../../api/client.ts'
import Breadcrumbs from './Breadcrumbs'
import Stats from './Stats'
import SizeBar from './SizeBar'

type Props = {
  node: FlatNode
  rootSize: number
}

export default function NodeDetail({ node, rootSize }: Props) {
  const segments = node.path.split(' > ')
  const depth = segments.length - 1
  const percentOfRoot = rootSize > 0 ? (node.size / rootSize) * 100 : 0
  const percentOfRootLabel =
    percentOfRoot < 0.01 ? '<0.01' : percentOfRoot.toFixed(2)

  return (
    <div className="animate-fade-in" key={node.path}>
      <Breadcrumbs segments={segments} />
      <h1 className="text-xl font-semibold text-text-1 mb-5">{node.name}</h1>
      <Stats size={node.size} depth={depth} percentOfRootLabel={percentOfRootLabel} />
      {rootSize > 0 && (
        <SizeBar size={node.size} rootSize={rootSize} percentOfRoot={percentOfRoot} />
      )}
    </div>
  )
}
