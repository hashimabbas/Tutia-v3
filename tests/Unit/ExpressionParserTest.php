<?php

use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\ExpressionNode;
use App\Services\Crm\Expressions\Nodes\NotNode;
use App\Services\Crm\Expressions\Nodes\OrNode;
use App\Services\Crm\Expressions\Parser\ExpressionParseException;
use App\Services\Crm\Expressions\Parser\ExpressionParser;
use App\Services\Crm\Expressions\Parser\Lexer;
use App\Services\Crm\Expressions\Parser\TokenType;

beforeEach(function () {
    $this->parser = new ExpressionParser;
    $this->lexer = new Lexer;
});

function assertNode(ExpressionNode $node, string $expectedClass): ExpressionNode
{
    expect($node)->toBeInstanceOf($expectedClass);

    return $node;
}

function assertComparison(ExpressionNode $node, string $field, string $operator, mixed $value): void
{
    assertNode($node, ComparisonNode::class);
    expect($node->field->path)->toBe($field);
    expect($node->operator)->toBe($operator);
    expect($node->value->value)->toBe($value);
}

describe('Lexer — Tokenize', function () {
    it('tokenizes a simple field', function () {
        $tokens = $this->lexer->tokenize('status');

        expect($tokens)->toHaveCount(2);
        expect($tokens[0]->type)->toBe(TokenType::IDENTIFIER);
        expect($tokens[0]->value)->toBe('status');
        expect($tokens[1]->type)->toBe(TokenType::EOF);
    });

    it('tokenizes a dot-path field', function () {
        $tokens = $this->lexer->tokenize('deal.amount');

        expect($tokens)->toHaveCount(2);
        expect($tokens[0]->type)->toBe(TokenType::IDENTIFIER);
        expect($tokens[0]->value)->toBe('deal.amount');
    });

    it('tokenizes an integer', function () {
        $tokens = $this->lexer->tokenize('10000');

        expect($tokens[0]->type)->toBe(TokenType::NUMBER);
        expect($tokens[0]->value)->toBe('10000');
    });

    it('tokenizes a negative integer', function () {
        $tokens = $this->lexer->tokenize('-5');

        expect($tokens[0]->type)->toBe(TokenType::NUMBER);
        expect($tokens[0]->value)->toBe('-5');
    });

    it('tokenizes a float', function () {
        $tokens = $this->lexer->tokenize('99.5');

        expect($tokens[0]->type)->toBe(TokenType::NUMBER);
        expect($tokens[0]->value)->toBe('99.5');
    });

    it('tokenizes a double-quoted string', function () {
        $tokens = $this->lexer->tokenize('"open"');

        expect($tokens[0]->type)->toBe(TokenType::STRING);
        expect($tokens[0]->value)->toBe('open');
    });

    it('tokenizes a single-quoted string', function () {
        $tokens = $this->lexer->tokenize("'proposal'");

        expect($tokens[0]->type)->toBe(TokenType::STRING);
        expect($tokens[0]->value)->toBe('proposal');
    });

    it('tokenizes a string with spaces', function () {
        $tokens = $this->lexer->tokenize('"in progress"');

        expect($tokens[0]->type)->toBe(TokenType::STRING);
        expect($tokens[0]->value)->toBe('in progress');
    });

    it('tokenizes booleans', function () {
        $trueTokens = $this->lexer->tokenize('true');
        $falseTokens = $this->lexer->tokenize('FALSE');

        expect($trueTokens[0]->type)->toBe(TokenType::BOOLEAN);
        expect($trueTokens[0]->value)->toBe('true');
        expect($falseTokens[0]->type)->toBe(TokenType::BOOLEAN);
        expect($falseTokens[0]->value)->toBe('FALSE');
    });

    it('tokenizes keywords case-insensitively', function () {
        $tokens = $this->lexer->tokenize('AND and OR or NOT not IN in');

        expect($tokens[0]->type)->toBe(TokenType::AND);
        expect($tokens[0]->value)->toBe('AND');
        expect($tokens[1]->type)->toBe(TokenType::AND);
        expect($tokens[2]->type)->toBe(TokenType::OR);
        expect($tokens[3]->type)->toBe(TokenType::OR);
        expect($tokens[4]->type)->toBe(TokenType::NOT);
        expect($tokens[5]->type)->toBe(TokenType::NOT);
        expect($tokens[6]->type)->toBe(TokenType::IN);
        expect($tokens[7]->type)->toBe(TokenType::IN);
    });

    it('tokenizes comparison operators', function () {
        $eq = $this->lexer->tokenize('=');
        $neq = $this->lexer->tokenize('!=');
        $gt = $this->lexer->tokenize('>');
        $gte = $this->lexer->tokenize('>=');
        $lt = $this->lexer->tokenize('<');
        $lte = $this->lexer->tokenize('<=');

        expect($eq[0]->type)->toBe(TokenType::EQ);
        expect($neq[0]->type)->toBe(TokenType::NEQ);
        expect($gt[0]->type)->toBe(TokenType::GT);
        expect($gte[0]->type)->toBe(TokenType::GTE);
        expect($lt[0]->type)->toBe(TokenType::LT);
        expect($lte[0]->type)->toBe(TokenType::LTE);
    });

    it('tokenizes parentheses', function () {
        $tokens = $this->lexer->tokenize('()');

        expect($tokens[0]->type)->toBe(TokenType::LPAREN);
        expect($tokens[1]->type)->toBe(TokenType::RPAREN);
    });

    it('tokenizes a complete comparison', function () {
        $tokens = $this->lexer->tokenize('amount > 10000');

        expect($tokens)->toHaveCount(4);
        expect($tokens[0]->type)->toBe(TokenType::IDENTIFIER);
        expect($tokens[0]->value)->toBe('amount');
        expect($tokens[1]->type)->toBe(TokenType::GT);
        expect($tokens[2]->type)->toBe(TokenType::NUMBER);
        expect($tokens[2]->value)->toBe('10000');
        expect($tokens[3]->type)->toBe(TokenType::EOF);
    });

    it('tokenizes contains', function () {
        $tokens = $this->lexer->tokenize('name CONTAINS "test"');

        expect($tokens[0]->type)->toBe(TokenType::IDENTIFIER);
        expect($tokens[1]->type)->toBe(TokenType::CONTAINS);
        expect($tokens[2]->type)->toBe(TokenType::STRING);
    });

    it('tokenizes starts_with', function () {
        $tokens = $this->lexer->tokenize('name STARTS_WITH "abc"');

        expect($tokens[0]->type)->toBe(TokenType::IDENTIFIER);
        expect($tokens[1]->type)->toBe(TokenType::STARTS_WITH);
        expect($tokens[2]->type)->toBe(TokenType::STRING);
    });

    it('tokenizes ends_with', function () {
        $tokens = $this->lexer->tokenize('name ENDS_WITH "xyz"');

        expect($tokens[0]->type)->toBe(TokenType::IDENTIFIER);
        expect($tokens[1]->type)->toBe(TokenType::ENDS_WITH);
        expect($tokens[2]->type)->toBe(TokenType::STRING);
    });

    it('handles empty expression', function () {
        $tokens = $this->lexer->tokenize('');

        expect($tokens)->toHaveCount(1);
        expect($tokens[0]->type)->toBe(TokenType::EOF);
    });

    it('handles whitespace', function () {
        $tokens = $this->lexer->tokenize('   a   >   1   ');

        expect($tokens[0]->value)->toBe('a');
        expect($tokens[1]->type)->toBe(TokenType::GT);
        expect($tokens[2]->value)->toBe('1');
        expect($tokens[3]->type)->toBe(TokenType::EOF);
    });

    it('throws on unterminated string', function () {
        $this->lexer->tokenize('"unclosed');
    })->throws(ExpressionParseException::class, 'Unterminated string');

    it('throws on unexpected character', function () {
        $this->lexer->tokenize('@invalid');
    })->throws(ExpressionParseException::class, 'Unexpected character');
});

describe('Parser — Simple Comparisons', function () {
    it('parses eq operator', function () {
        $ast = $this->parser->parse('status = "open"');

        assertComparison($ast, 'status', '=', 'open');
    });

    it('parses eq with number', function () {
        $ast = $this->parser->parse('amount = 10000');

        assertComparison($ast, 'amount', '=', 10000);
    });

    it('parses eq with boolean', function () {
        $ast = $this->parser->parse('vip = true');

        assertComparison($ast, 'vip', '=', true);
    });

    it('parses greater than', function () {
        $ast = $this->parser->parse('amount > 5000');

        assertComparison($ast, 'amount', '>', 5000);
    });

    it('parses greater than or equal', function () {
        $ast = $this->parser->parse('amount >= 100');

        assertComparison($ast, 'amount', '>=', 100);
    });

    it('parses less than', function () {
        $ast = $this->parser->parse('score < 50');

        assertComparison($ast, 'score', '<', 50);
    });

    it('parses less than or equal', function () {
        $ast = $this->parser->parse('score <= 75');

        assertComparison($ast, 'score', '<=', 75);
    });

    it('parses not equal', function () {
        $ast = $this->parser->parse('status != "closed"');

        assertComparison($ast, 'status', '!=', 'closed');
    });

    it('parses field with dot-path', function () {
        $ast = $this->parser->parse('deal.amount > 10000');

        assertComparison($ast, 'deal.amount', '>', 10000);
    });

    it('parses deep dot-path', function () {
        $ast = $this->parser->parse('project.risk.assessment.score > 80');

        assertComparison($ast, 'project.risk.assessment.score', '>', 80);
    });

    it('parses contains operator', function () {
        $ast = $this->parser->parse('name CONTAINS "test"');

        assertComparison($ast, 'name', 'contains', 'test');
    });

    it('parses starts_with operator', function () {
        $ast = $this->parser->parse('code STARTS_WITH "ABC"');

        assertComparison($ast, 'code', 'starts_with', 'ABC');
    });

    it('parses ends_with operator', function () {
        $ast = $this->parser->parse('code ENDS_WITH "XYZ"');

        assertComparison($ast, 'code', 'ends_with', 'XYZ');
    });

    it('parses in operator', function () {
        $ast = $this->parser->parse('status IN "active"');

        assertComparison($ast, 'status', 'in', 'active');
    });

    it('parses negative number', function () {
        $ast = $this->parser->parse('temperature > -5');

        assertComparison($ast, 'temperature', '>', -5);
    });

    it('parses a float value', function () {
        $ast = $this->parser->parse('price <= 99.50');

        assertComparison($ast, 'price', '<=', 99.50);
    });
});

describe('Parser — AND / OR / NOT', function () {
    it('parses A AND B', function () {
        $ast = $this->parser->parse('amount > 1000 AND status = "open"');

        assertNode($ast, AndNode::class);
        expect($ast->children)->toHaveCount(2);
        assertComparison($ast->children[0], 'amount', '>', 1000);
        assertComparison($ast->children[1], 'status', '=', 'open');
    });

    it('parses A OR B', function () {
        $ast = $this->parser->parse('status = "open" OR status = "pending"');

        assertNode($ast, OrNode::class);
        expect($ast->children)->toHaveCount(2);
        assertComparison($ast->children[0], 'status', '=', 'open');
        assertComparison($ast->children[1], 'status', '=', 'pending');
    });

    it('parses A AND B AND C', function () {
        $ast = $this->parser->parse('a > 1 AND b > 2 AND c > 3');

        assertNode($ast, AndNode::class);
        expect($ast->children)->toHaveCount(2);
        assertNode($ast->children[0], AndNode::class);
        expect($ast->children[0]->children)->toHaveCount(2);
        assertComparison($ast->children[0]->children[0], 'a', '>', 1);
        assertComparison($ast->children[0]->children[1], 'b', '>', 2);
        assertComparison($ast->children[1], 'c', '>', 3);
    });

    it('parses A OR B OR C', function () {
        $ast = $this->parser->parse('a = 1 OR b = 2 OR c = 3');

        assertNode($ast, OrNode::class);
        expect($ast->children)->toHaveCount(2);
        assertNode($ast->children[0], OrNode::class);
        expect($ast->children[0]->children)->toHaveCount(2);
    });

    it('parses NOT A', function () {
        $ast = $this->parser->parse('NOT vip = true');

        assertNode($ast, NotNode::class);
        assertComparison($ast->child, 'vip', '=', true);
    });

    it('parses NOT (A AND B)', function () {
        $ast = $this->parser->parse('NOT (status = "active" AND score > 50)');

        assertNode($ast, NotNode::class);
        assertNode($ast->child, AndNode::class);
        expect($ast->child->children)->toHaveCount(2);
    });

    it('parses A AND NOT B', function () {
        $ast = $this->parser->parse('active = true AND NOT vip = true');

        assertNode($ast, AndNode::class);
        expect($ast->children)->toHaveCount(2);
        assertComparison($ast->children[0], 'active', '=', true);
        assertNode($ast->children[1], NotNode::class);
    });
});

describe('Parser — Grouped expressions', function () {
    it('parses (A AND B)', function () {
        $ast = $this->parser->parse('(amount > 1000 AND status = "open")');

        assertNode($ast, AndNode::class);
        expect($ast->children)->toHaveCount(2);
        assertComparison($ast->children[0], 'amount', '>', 1000);
        assertComparison($ast->children[1], 'status', '=', 'open');
    });

    it('parses (A AND B) OR (C AND D)', function () {
        $ast = $this->parser->parse('(amount > 1000 AND status = "open") OR (vip = true AND risk > 80)');

        assertNode($ast, OrNode::class);
        expect($ast->children)->toHaveCount(2);
        assertNode($ast->children[0], AndNode::class);
        assertNode($ast->children[1], AndNode::class);

        $leftAnd = $ast->children[0];
        assertComparison($leftAnd->children[0], 'amount', '>', 1000);
        assertComparison($leftAnd->children[1], 'status', '=', 'open');

        $rightAnd = $ast->children[1];
        assertComparison($rightAnd->children[0], 'vip', '=', true);
        assertComparison($rightAnd->children[1], 'risk', '>', 80);
    });

    it('parses (A AND B) OR (C AND D) — the full reference example', function () {
        $ast = $this->parser->parse('(deal.amount > 10000 AND deal.stage = "proposal") OR (customer.vip = true AND project.risk_score > 80)');

        assertNode($ast, OrNode::class);
        expect($ast->children)->toHaveCount(2);

        $leftAnd = $ast->children[0];
        expect($leftAnd)->toBeInstanceOf(AndNode::class);
        expect($leftAnd->children)->toHaveCount(2);
        assertComparison($leftAnd->children[0], 'deal.amount', '>', 10000);
        assertComparison($leftAnd->children[1], 'deal.stage', '=', 'proposal');

        $rightAnd = $ast->children[1];
        expect($rightAnd)->toBeInstanceOf(AndNode::class);
        expect($rightAnd->children)->toHaveCount(2);
        assertComparison($rightAnd->children[0], 'customer.vip', '=', true);
        assertComparison($rightAnd->children[1], 'project.risk_score', '>', 80);
    });

    it('parses ((A AND B) OR C) AND D — multiple nesting', function () {
        $ast = $this->parser->parse('((a > 1 AND b > 2) OR c > 3) AND d > 4');

        assertNode($ast, AndNode::class);
        expect($ast->children)->toHaveCount(2);

        assertNode($ast->children[0], OrNode::class);
        $orNode = $ast->children[0];
        assertNode($orNode->children[0], AndNode::class);
        expect($orNode->children[0]->children)->toHaveCount(2);
        assertComparison($orNode->children[1], 'c', '>', 3);

        assertComparison($ast->children[1], 'd', '>', 4);
    });

    it('parses NOT (A OR B)', function () {
        $ast = $this->parser->parse('NOT (status = "closed" OR status = "cancelled")');

        assertNode($ast, NotNode::class);
        assertNode($ast->child, OrNode::class);
        expect($ast->child->children)->toHaveCount(2);
        assertComparison($ast->child->children[0], 'status', '=', 'closed');
        assertComparison($ast->child->children[1], 'status', '=', 'cancelled');
    });
});

describe('Parser — Invalid Syntax', function () {
    it('rejects empty expression', function () {
        $this->parser->parse('');
    })->throws(ExpressionParseException::class);

    it('rejects missing operator', function () {
        $this->parser->parse('amount');
    })->throws(ExpressionParseException::class, 'Expected operator');

    it('rejects missing value', function () {
        $this->parser->parse('amount >');
    })->throws(ExpressionParseException::class, 'Expected value');

    it('rejects unclosed parenthesis', function () {
        $this->parser->parse('(amount > 1000');
    })->throws(ExpressionParseException::class, 'Expected closing parenthesis');

    it('rejects unexpected closing parenthesis', function () {
        $this->parser->parse(')');
    })->throws(ExpressionParseException::class, 'Expected field name');

    it('rejects extra tokens after expression', function () {
        $this->parser->parse('amount > 1000 extra');
    })->throws(ExpressionParseException::class, 'Unexpected token after expression');

    it('rejects field with no value', function () {
        $this->parser->parse('status =');
    })->throws(ExpressionParseException::class, 'Expected value');

    it('rejects OR without left operand', function () {
        $this->parser->parse('OR status = "open"');
    })->throws(ExpressionParseException::class, 'Expected field name');

    it('rejects AND without right operand', function () {
        $this->parser->parse('status = "open" AND');
    })->throws(ExpressionParseException::class, 'Expected field name');

    it('rejects double operator', function () {
        $this->parser->parse('amount >< 100');
    })->throws(ExpressionParseException::class, 'Expected value');
});

describe('Parser — Operator edge cases', function () {
    it('handles whitespace between tokens', function () {
        $ast = $this->parser->parse('  amount  >  1000  AND  status  =  "open"  ');

        assertNode($ast, AndNode::class);
        assertComparison($ast->children[0], 'amount', '>', 1000);
        assertComparison($ast->children[1], 'status', '=', 'open');
    });

    it('parses false boolean value', function () {
        $ast = $this->parser->parse('active = FALSE');

        assertComparison($ast, 'active', '=', false);
    });

    it('parses multiple levels of nesting', function () {
        $ast = $this->parser->parse('(a = 1 AND (b = 2 OR c = 3))');

        assertNode($ast, AndNode::class);
        expect($ast->children)->toHaveCount(2);
        assertComparison($ast->children[0], 'a', '=', 1);
        assertNode($ast->children[1], OrNode::class);
    });
});

describe('Parser — implements ExpressionParserInterface', function () {
    it('is an instance of ExpressionParserInterface', function () {
        expect($this->parser)->toBeInstanceOf(ExpressionParserInterface::class);
    });
});
