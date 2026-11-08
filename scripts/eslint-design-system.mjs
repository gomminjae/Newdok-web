const controls = new Set(['Button', 'ButtonLink', 'Chip', 'Input', 'Select', 'Dropdown', 'SegmentPicker', 'Tabs']);
const appearance = /(?:^|\s)(?:[\w-]+:)*(?:bg-|text-|font-|border(?:-|$)|rounded|h-|min-h-|max-h-|p[xytrbl]?-|opacity-|shadow)/;
const rawColor = /(?:bg|text|border|fill|stroke|from|to|via|shadow)-\[[^\]]*(?:#[\da-f]{3,8}|rgba?\()/i;

function strings(node) {
  if (!node) return [];
  if (node.type === 'Literal' && typeof node.value === 'string') return [node.value];
  if (node.type === 'TemplateLiteral') return node.quasis.map((part) => part.value.raw).concat(node.expressions.flatMap(strings));
  if (node.type === 'JSXExpressionContainer') return strings(node.expression);
  if (node.type === 'CallExpression') return node.arguments.flatMap(strings);
  if (node.type === 'ConditionalExpression') return [...strings(node.consequent), ...strings(node.alternate)];
  if (node.type === 'LogicalExpression') return [...strings(node.left), ...strings(node.right)];
  if (node.type === 'ArrayExpression') return node.elements.flatMap(strings);
  if (node.type === 'ObjectExpression') return node.properties.flatMap((property) => strings(property.key));
  return [];
}

const designSystem = {
  rules: {
    'shared-appearance': {
      meta: { type: 'problem', schema: [], messages: { override: '공통 UI의 외형은 src/design-system에서 관리합니다. variant·size·radius를 사용하고 화면에는 배치만 지정하세요.', color: '직접 색상 값을 적는 대신 src/design-system의 의미 색상 토큰을 사용하세요.' } },
      create(context) {
        return {
          JSXAttribute(node) {
            const name = node.name.name;
            const control = node.parent.name?.name;
            if (controls.has(control) && (name === 'style' || name === 'className' && strings(node.value).some((value) => appearance.test(value)))) context.report({ node, messageId: 'override' });
            if (name === 'className' && strings(node.value).some((value) => rawColor.test(value))) context.report({ node, messageId: 'color' });
          },
        };
      },
    },
  },
};

export default designSystem;
