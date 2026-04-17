<template>
    <section>
        <p class="text-xl text-[#545b64] leading-relaxed mb-10 font-medium">
            Serwin Systems uses a transparent, usage-based billing model. For this portfolio
            prototype, all charges are nominal to allow for easy exploration.
        </p>

        <h2 class="text-3xl font-black text-[#232f3e] mb-6">Prototype Credits</h2>
        <p class="text-[#545b64] font-medium leading-relaxed mb-8">
            Since this is currently a prototype project, users are granted "Demo Credits" upon
            registration. These credits can be used to spin up instances and create storage buckets
            without actual financial commitment.
        </p>

        <div class="grid md:grid-cols-2 gap-8 my-12">
            <div class="p-8 border-2 border-[#eaeded]">
                <h4 class="font-black text-[#232f3e] mb-4 uppercase tracking-widest text-xs">Pricing
                    Tiers</h4>
                <p class="text-sm text-[#545b64] font-medium leading-relaxed">
                    We currently offer three tiers: Freelancer (Free), Builder ($3), and Enterprise
                    ($3). These nominal fees represent the premium nature of the underlying hardware
                    while remaining accessible for demonstration purposes.
                </p>
            </div>
            <div class="p-8 border-2 border-[#eaeded]">
                <h4 class="font-black text-[#232f3e] mb-4 uppercase tracking-widest text-xs">Invoice
                    Generation</h4>
                <p class="text-sm text-[#545b64] font-medium leading-relaxed">
                    Invoices are generated at the end of each billing cycle (or upon demand in the
                    prototype). You can view your detailed usage reports in the Billing Dashboard.
                </p>
            </div>
        </div>

        <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8">
            <h4 class="font-black text-[#232f3e] mb-2 uppercase tracking-tight">Security & Payments
            </h4>
            <p class="text-sm text-[#545b64] font-medium leading-relaxed">
                Our payment processing is handled through secure, PCI-compliant providers. We do not
                store raw credit card data on our servers.
            </p>
        </div>
    </section>
</template>
