<?php

namespace App\Services\Crm\Expressions\Parser;

class ExpressionParseException extends \RuntimeException
{
    public function __construct(string $message = '')
    {
        parent::__construct($message);
    }
}
