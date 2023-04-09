import j from 'jscodeshift'

const imports = j.variableDeclaration('const', [
  j.variableDeclarator(
    j.objectPattern([
      j.property.from({
        kind: 'init',
        key: j.identifier('configure'),
        value: j.identifier('configure'),
        shorthand: true,
      }),
      j.property.from({
        kind: 'init',
        key: j.identifier('presets'),
        value: j.identifier('presets'),
        shorthand: true,
      }),
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
  return j.property('init', j.identifier('presets'), j.arrayExpression(items))
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

export const allowDebugFromEnv = () => {
  return j.property.from({
    kind: 'init',
    key: j.identifier('allowDebug'),
    value: j.identifier(`process.env.NODE_ENV !== "production"`),
  })
}

export const config = (properties: j.Property[]) => {
  return j.program([imports, configure(properties)])
}

export const toSource = (config: Config) => {
  return j(config).toSource()
}

export type Preset = ReturnType<typeof preset>
export type Config = ReturnType<typeof config>
