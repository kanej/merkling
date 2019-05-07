import MerklingSession from "../src/merklingSession";
import { Merkling, IIpfsNode } from "../src/merkling";
import MockIpfs from "./mockIpfs";



describe('Session', () => {
    let session: MerklingSession

    beforeEach(() => {
        session = new MerklingSession({ ipfs: new MockIpfs() })
    })

    describe('creating', () => {
        let proxy: any

        describe('from a value', () => {
            it('returns undefined for undefined', () => {
                expect(session.create((undefined as any))).toBe(undefined)
            })

            it('returns null for null', () => {
                expect(session.create((null as any))).toBe(null)
            })

            it('returns the identical number for a number', () => {
                expect(session.create((5 as any))).toBe(5)
            })

            it('returns the identical string for a string', () => {
                expect(session.create(('example' as any))).toBe('example')
            })

            it('returns the identical boolean for a boolean', () => {
                expect(session.create((true as any))).toBe(true)
            })
        })

        describe('from simple pojo', () => {
            const simplePojo = Object.freeze({
                text: 'example',
                num: 5,
                bool: true,
                undefinedProp: undefined,
                nullProp: null
            })

            beforeEach(() => {
                proxy = session.create(simplePojo)
            })

            it('returns a Merkling proxy', () => {
                expect(Merkling.isProxy(proxy)).toBe(true)
            })

            it('returns a proxy that is an IPLD node', () => {
                expect(Merkling.isIpldNode(proxy)).toBe(true)
            })

            it('returns a proxy that is dirty', () => {
                expect(Merkling.isDirty(proxy)).toBe(true)
            })

            it('returns a proxy that can have its properties accessed', () => {
                expect(proxy.text).toBe('example')
                expect(proxy.num).toBe(5)
                expect(proxy.bool).toBe(true)
                expect(proxy.undefinedProp).toBe(undefined)
                expect(proxy.nullProp).toBe(null)
            })
            
            it('returns a proxy that can responds to unknown property lookups', () => {
                expect(proxy.unknown).toBe(undefined)
            })
        })

        describe('from a single nested pojo', () => {
            const singlyNestedPojo = Object.freeze({
                text: 'single-nesting',
                nested: {
                    text: 'example',
                    num: 5,
                    bool: true,
                    undefinedProp: undefined,
                    nullProp: null
                }
            })

            beforeEach(() => {
                proxy = session.create(singlyNestedPojo)
            })

            it('returns a Merkling proxy', () => {
                expect(Merkling.isProxy(proxy)).toBe(true)
            })

            it('returns a proxy that is an IPLD node', () => {
                expect(Merkling.isIpldNode(proxy)).toBe(true)
            })

            it('returns a proxy that is structurally equal to the original', () => {
                expect(proxy).toStrictEqual(singlyNestedPojo)
            })

            describe('accessing its nested object', () => {
                let nested: any

                beforeEach(() => {
                    nested = proxy.nested
                })

                it('returns a Merkling proxy', () => {
                    expect(Merkling.isProxy(nested)).toBe(true)
                })
    
                it('returns a proxy that is not an IPLD node', () => {
                    expect(Merkling.isIpldNode(nested)).toBe(false)
                })

                it('returns a proxy that can have its properties accessed', () => {
                    expect(nested.text).toBe('example')
                    expect(nested.num).toBe(5)
                    expect(nested.bool).toBe(true)
                    expect(nested.undefinedProp).toBe(undefined)
                    expect(nested.nullProp).toBe(null)
                })
            })
        })
    })

    describe('saving', () => {
        let proxy: any
        let mockIpfs: MockIpfs

        beforeEach(() => {
            mockIpfs = new MockIpfs()
            session = new MerklingSession({ ipfs: mockIpfs })
        })

        describe('simple pojo', () => {
            let simplePojo = Object.freeze({
                text: 'example',
                num: 5,
                bool: true,
                undefinedProp: undefined,
                nullProp: null
            })

            beforeEach(() => {
                mockIpfs.map(simplePojo, 'Q111111111111111')
                proxy = session.create(simplePojo)
                session.save()
            })

            it('should mark the proxy as clean', () => {
                expect(Merkling.isDirty(proxy)).toBe(false)
            })

            it('should set the cid against the proxy', () => {
                expect(Merkling.cid(proxy)).toBe('Q111111111111111')
            })
        })
    })

    describe('updating', () => {
        let proxy: any

        describe('simple pojo', () => {
            let simplePojo = Object.freeze({
                text: 'example',
                num: 5,
                bool: true,
                undefinedProp: undefined,
                nullProp: null
            })

            beforeEach(() => {
                proxy = session.create(simplePojo)
            })

            test.todo('marks the ipld node as dirty')
        })
    })
})
