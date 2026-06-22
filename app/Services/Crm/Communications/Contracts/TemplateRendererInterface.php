<?php

namespace App\Services\Crm\Communications\Contracts;

interface TemplateRendererInterface
{
    public function render(string $template, array $payload, string $locale): string;
}
