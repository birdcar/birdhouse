import nj from 'nunjucks';

interface EnvironmentContext {
  env: {
    [key: string]: any
  }
  gh: {
    [key: string]: any
  }
  payload: any,
}

function loadTemplateContext(): EnvironmentContext {
  const inputs: EnvironmentContext = {
    env: {},
    gh: {},
    payload: {},
  }

  for (const key in process.env) {
    if (key === "GITHUB_EVENT_PATH") {
      inputs.payload = process.env[key]
    } else if (key.startsWith('GITHUB') || key.startsWith("RUNNER")) {
      inputs.gh[key] = process.env[key]
    } else {
      inputs.env[key] = process.env[key]
    }
  }

  return inputs
}

export function loadTemplate(template_name: string, additionalContext?: any) {
  const env = new nj.Environment(
    new nj.FileSystemLoader(`.birdhouse/templates`),
    {
      throwOnUndefined: true,
    }
  )

  return env.render(template_name, {
    ...loadTemplateContext(),
    config: {
      ...additionalContext
    },
  })
}
