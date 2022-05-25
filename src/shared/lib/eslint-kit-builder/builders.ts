import j from 'jscodeshift'

const imports = j.variableDeclaration('const', [
  j.variableDeclarator(
    j.objectPattern([
      j.property('init', j.identifier('configure'), j.identifier('configure')),
      j.property('init', j.identifier('presets'), j.identifier('presets')),
    ]),
    j.callExpression(j.identifier('require'), [j.literal('eslint-kit')])
  ),
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const preset = (name: string, options?: Record<string, any>) => {
  return j.callExpression(
    j.memberExpression(j.identifier('presets'), j.identifier(name)),
    options ? j(JSON.stringify(options)).nodes[0] : []
  )
}

export const presets = (items: j.CallExpression[]) => {
  return j.property('set', j.identifier('presets'), j.arrayExpression(items))
}

const configure = (properties: j.Property[]) => {
  return j.expressionStatement(
    j.assignmentExpression(
      '=',
      j.memberExpression(j.identifier('module'), j.identifier('exports')),
      j.callExpression(j.identifier('configure'), [
        j.objectExpression(properties),
      ])
    )
  )
}

export const config = (preperties: j.Property[]) => {
  return j.program([imports, configure(preperties)])
}

export type Preset = ReturnType<typeof preset>
export type Config = ReturnType<typeof config>
