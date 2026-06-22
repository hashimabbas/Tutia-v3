<?php

namespace App\Services\Crm\Expressions\Parser;

enum TokenType: string
{
    case IDENTIFIER = 'IDENTIFIER';
    case NUMBER = 'NUMBER';
    case STRING = 'STRING';
    case BOOLEAN = 'BOOLEAN';

    case AND = 'AND';
    case OR = 'OR';
    case NOT = 'NOT';
    case IN = 'IN';
    case NOT_IN = 'NOT_IN';
    case CONTAINS = 'CONTAINS';
    case STARTS_WITH = 'STARTS_WITH';
    case ENDS_WITH = 'ENDS_WITH';

    case EQ = 'EQ';
    case NEQ = 'NEQ';
    case GT = 'GT';
    case GTE = 'GTE';
    case LT = 'LT';
    case LTE = 'LTE';

    case LPAREN = 'LPAREN';
    case RPAREN = 'RPAREN';

    case EOF = 'EOF';
}
