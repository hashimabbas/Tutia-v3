<?php

namespace App\Services\Crm\Expressions\Parser;

use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\ExpressionNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\NotNode;
use App\Services\Crm\Expressions\Nodes\OrNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;

class ExpressionParser implements ExpressionParserInterface
{
    private Lexer $lexer;

    /** @var Token[] */
    private array $tokens;

    private int $pos = 0;

    public function __construct()
    {
        $this->lexer = new Lexer;
    }

    public function parse(string $expression): ExpressionNode
    {
        $this->tokens = $this->lexer->tokenize($expression);
        $this->pos = 0;

        $result = $this->orExpression();

        if ($this->peek()->type !== TokenType::EOF) {
            throw $this->error('Unexpected token after expression');
        }

        return $result;
    }

    private function orExpression(): ExpressionNode
    {
        $left = $this->andExpression();

        while ($this->match(TokenType::OR)) {
            $right = $this->andExpression();
            $left = new OrNode([$left, $right]);
        }

        return $left;
    }

    private function andExpression(): ExpressionNode
    {
        $left = $this->unary();

        while ($this->match(TokenType::AND)) {
            $right = $this->unary();
            $left = new AndNode([$left, $right]);
        }

        return $left;
    }

    private function unary(): ExpressionNode
    {
        if ($this->match(TokenType::NOT)) {
            $child = $this->unary();

            return new NotNode($child);
        }

        return $this->comparison();
    }

    private function comparison(): ExpressionNode
    {
        if ($this->match(TokenType::LPAREN)) {
            $expr = $this->orExpression();

            if (! $this->match(TokenType::RPAREN)) {
                throw $this->error('Expected closing parenthesis');
            }

            return $expr;
        }

        $field = $this->expect(TokenType::IDENTIFIER, 'Expected field name');
        $operator = $this->parseOperator();
        $value = $this->parseValue();

        return new ComparisonNode(
            new FieldNode($field->value),
            $operator,
            $value,
        );
    }

    private function parseOperator(): string
    {
        $map = [
            '=' => TokenType::EQ,
            '!=' => TokenType::NEQ,
            '>' => TokenType::GT,
            '>=' => TokenType::GTE,
            '<' => TokenType::LT,
            '<=' => TokenType::LTE,
            'in' => TokenType::IN,
            'not_in' => TokenType::NOT_IN,
            'contains' => TokenType::CONTAINS,
            'starts_with' => TokenType::STARTS_WITH,
            'ends_with' => TokenType::ENDS_WITH,
        ];

        foreach ($map as $op => $type) {
            if ($this->match($type)) {
                return $op;
            }
        }

        throw $this->error('Expected operator');
    }

    private function parseValue(): ValueNode
    {
        if ($this->match(TokenType::STRING)) {
            return new ValueNode($this->previous()->value);
        }

        if ($this->match(TokenType::NUMBER)) {
            $raw = $this->previous()->value;

            return new ValueNode(str_contains($raw, '.') ? (float) $raw : (int) $raw);
        }

        if ($this->match(TokenType::BOOLEAN)) {
            return new ValueNode(strtoupper($this->previous()->value) === 'TRUE');
        }

        throw $this->error('Expected value (string, number, or boolean)');
    }

    private function match(TokenType $type): bool
    {
        if ($this->peek()->type === $type) {
            $this->pos++;

            return true;
        }

        return false;
    }

    private function expect(TokenType $type, string $message): Token
    {
        if ($this->peek()->type !== $type) {
            throw $this->error($message);
        }

        $token = $this->tokens[$this->pos];
        $this->pos++;

        return $token;
    }

    private function peek(): Token
    {
        return $this->tokens[$this->pos];
    }

    private function previous(): Token
    {
        return $this->tokens[$this->pos - 1];
    }

    private function error(string $message): ExpressionParseException
    {
        $token = $this->peek();

        if ($token->type === TokenType::EOF) {
            return new ExpressionParseException("{$message} at end of input");
        }

        return new ExpressionParseException("{$message} at line {$token->line}, column {$token->column}");
    }
}
