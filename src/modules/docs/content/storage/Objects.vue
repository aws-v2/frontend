<template>
    <section>
        <h2 class="text-3xl font-black text-[#232f3e] mb-6">Object Operations</h2>
        <p class="text-lg text-[#545b64] font-medium mb-8 leading-relaxed">
            Objects are the fundamental entities stored in Amazon S3. They consist of object data
            and metadata. The metadata is a set of name-value pairs that describe the object.
        </p>
        <div class="space-y-8">
            <div class="p-8 border-2 border-[#232f3e]">
                <h4 class="font-black text-[#232f3e] mb-4 uppercase tracking-tight">Standard Operations</h4>
                <ul class="grid grid-cols-2 gap-4 text-sm font-bold text-[#545b64] list-none">
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-[#ff9900]"></div> PUT Object
                    </li>
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-[#ff9900]"></div> GET Object
                    </li>
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-[#ff9900]"></div> DELETE Object
                    </li>
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-[#ff9900]"></div> HEAD Object
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
