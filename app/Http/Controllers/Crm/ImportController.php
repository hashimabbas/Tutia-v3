<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmImport;
use App\Services\Crm\CrmDuplicateDetectionService;
use App\Services\Crm\CrmImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function __construct(
        private readonly CrmImportService $importService,
        private readonly CrmDuplicateDetectionService $duplicates,
    ) {}

    public function index()
    {
        $this->authorize('viewAny', CrmImport::class);

        $imports = CrmImport::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return inertia('crm/imports/index', [
            'imports' => $imports,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CrmImport::class);

        $validated = $request->validate([
            'entity_type' => 'required|string|in:organizations,contacts',
            'rows' => 'required|array|min:1|max:5000',
            'rows.*.name' => 'required_if:entity_type,organizations|string|max:200',
            'rows.*.first_name' => 'required_if:entity_type,contacts|string|max:100',
            'rows.*.last_name' => 'required_if:entity_type,contacts|string|max:100',
            'rows.*.email' => 'nullable|email|max:200',
            'rows.*.phone' => 'nullable|string|max:50',
            'rows.*.domain' => 'nullable|string|max:200',
            'rows.*.industry' => 'nullable|string|max:100',
            'rows.*.organization_name' => 'nullable|string|max:200',
        ]);

        $import = CrmImport::create([
            'user_id' => $request->user()->id,
            'entity_type' => $validated['entity_type'],
            'filename' => 'inline_import_'.now()->format('Ymd_His'),
            'total_rows' => count($validated['rows']),
            'status' => 'pending',
        ]);

        if ($validated['entity_type'] === 'organizations') {
            $this->importService->importOrganizations($request->user()->id, $validated['rows'], $import);
        } else {
            $this->importService->importContacts($request->user()->id, $validated['rows'], $import);
        }

        return redirect()->route('crm.imports.index')->with('success', 'Import completed');
    }

    public function show(CrmImport $import)
    {
        $this->authorize('view', $import);

        return inertia('crm/imports/show', [
            'import' => $import->load('user'),
        ]);
    }
}
